package sensor

import (
	"backend-go/internal/alert"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"time"
)

type AlertChecker interface {
	CheckAndCreate(vehicleID string, fuelAutonomy float64) (*alert.Alert, error)
}

type Broadcaster interface {
	Broadcast(event string, payload any)
}

type Reading struct {
	ID           string    `json:"id"`
	VehicleID    string    `json:"vehicle_id"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	Speed        float64   `json:"speed"`
	FuelLevel    float64   `json:"fuel_level"`
	FuelAutonomy float64   `json:"fuel_autonomy"`
	Temperature  float64   `json:"temperature"`
	RecordedAt   time.Time `json:"recorded_at"`
}

type ReadingInput struct {
	VehicleID   string  `json:"vehicle_id"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Speed       float64 `json:"speed"`
	FuelLevel   float64 `json:"fuel_level"`
	Temperature float64 `json:"temperature"`
}

type Service struct {
	db           *sql.DB
	alertService AlertChecker
	hub          Broadcaster
}

func NewService(db *sql.DB, alertService AlertChecker, hub Broadcaster) *Service {
	return &Service{db: db, alertService: alertService, hub: hub}
}

func (s *Service) Save(input ReadingInput) (*Reading, error) {
	autonomy := calcFuelAutonomy(input.FuelLevel, input.Speed)

	reading := &Reading{
		ID:           generateID(),
		VehicleID:    input.VehicleID,
		Latitude:     input.Latitude,
		Longitude:    input.Longitude,
		Speed:        input.Speed,
		FuelLevel:    input.FuelLevel,
		FuelAutonomy: autonomy,
		Temperature:  input.Temperature,
		RecordedAt:   time.Now(),
	}

	_, err := s.db.Exec(`
		INSERT INTO sensor_readings
			(id, vehicle_id, latitude, longitude, speed, fuel_level, fuel_autonomy, temperature, recorded_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		reading.ID, reading.VehicleID, reading.Latitude, reading.Longitude,
		reading.Speed, reading.FuelLevel, reading.FuelAutonomy,
		reading.Temperature, reading.RecordedAt,
	)
	if err != nil {
		return nil, err
	}

	// Evalúa alerta de combustible automáticamente (Menos de 1 hora)
	if reading.FuelAutonomy < 1.0 {
		alert, err := s.alertService.CheckAndCreate(reading.VehicleID, reading.FuelAutonomy)
		if err == nil && alert != nil {
			// si hay alerta nueva, también la transmite
			s.hub.Broadcast("alert", alert)
		}
	}

	// broadcast de la lectura a todos los clientes ws
	s.hub.Broadcast("sensor_reading", reading)


	return reading, nil
}

func (s *Service) GetLatest() ([]Reading, error) {
	rows, err := s.db.Query(`
		SELECT id, vehicle_id, latitude, longitude, speed,
		       fuel_level, fuel_autonomy, temperature, recorded_at
		FROM sensor_readings
		GROUP BY vehicle_id
		HAVING MAX(recorded_at)`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	readings := make([]Reading, 0)
	for rows.Next() {
		var r Reading
		if err := rows.Scan(
			&r.ID, &r.VehicleID, &r.Latitude, &r.Longitude, &r.Speed,
			&r.FuelLevel, &r.FuelAutonomy, &r.Temperature, &r.RecordedAt,
		); err != nil {
			return nil, err
		}
		readings = append(readings, r)
	}
	return readings, nil
}

func (s *Service) GetHistory(vehicleID string, limit int) ([]Reading, error) {
	rows, err := s.db.Query(`
		SELECT id, vehicle_id, latitude, longitude, speed,
		       fuel_level, fuel_autonomy, temperature, recorded_at
		FROM sensor_readings
		WHERE vehicle_id = ?
		ORDER BY recorded_at DESC
		LIMIT ?`, vehicleID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	readings := make([]Reading, 0)
	for rows.Next() {
		var r Reading
		if err := rows.Scan(
			&r.ID, &r.VehicleID, &r.Latitude, &r.Longitude, &r.Speed,
			&r.FuelLevel, &r.FuelAutonomy, &r.Temperature, &r.RecordedAt,
		); err != nil {
			return nil, err
		}
		readings = append(readings, r)
	}
	return readings, nil
}

func calcFuelAutonomy(fuelLevel, speed float64) float64 {
	const baseFuelConsumptionPerHour = 10.0
	const baseSpeed = 80.0

	if speed <= 0 {
		return fuelLevel / baseFuelConsumptionPerHour
	}

	consumptionRate := baseFuelConsumptionPerHour * (speed / baseSpeed)
	return fuelLevel / consumptionRate
}

func generateID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}
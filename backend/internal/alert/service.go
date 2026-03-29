package alert

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"time"
)

const LowFuelAutonomyThreshold = 1.0 // horas

type Alert struct {
	ID        string    `json:"id"`
	VehicleID string    `json:"vehicle_id"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Resolved  bool      `json:"resolved"`
	CreatedAt time.Time `json:"created_at"`
}

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// CheckAndCreate evalúa una lectura y genera alerta si corresponde.
// lo llamas desde sensor.Service después de guardar cada lectura.
func (s *Service) CheckAndCreate(vehicleID string, fuelAutonomy float64) (*Alert, error) {
	if fuelAutonomy >= LowFuelAutonomyThreshold {
		return nil, nil // todo bien, sin alerta
	}

	alert := &Alert{
		ID:        generateID(),
		VehicleID: vehicleID,
		Type:      "low_fuel",
		Message:   "Autonomía de combustible menor a 1 hora",
		CreatedAt: time.Now(),
	}

	_, err := s.db.Exec(`
		INSERT INTO alerts (id, vehicle_id, type, message)
		VALUES (?, ?, ?, ?)`,
		alert.ID, alert.VehicleID, alert.Type, alert.Message,
	)
	return alert, err
}

// GetActive retorna alertas sin resolver (solo para admins)
func (s *Service) GetActive() ([]Alert, error) {
	rows, err := s.db.Query(`
		SELECT id, vehicle_id, type, message, resolved, created_at
		FROM alerts
		WHERE resolved = 0
		ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []Alert
	for rows.Next() {
		var a Alert
		var resolved int
		if err := rows.Scan(&a.ID, &a.VehicleID, &a.Type, &a.Message, &resolved, &a.CreatedAt); err != nil {
			return nil, err
		}
		a.Resolved = resolved == 1
		alerts = append(alerts, a)
	}
	return alerts, nil
}

// Resolve marca una alerta como resuelta
func (s *Service) Resolve(alertID string) error {
	_, err := s.db.Exec(`UPDATE alerts SET resolved = 1 WHERE id = ?`, alertID)
	return err
}

func generateID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}
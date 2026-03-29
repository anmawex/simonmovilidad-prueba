package vehicle

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

var ErrNotFound = errors.New("vehículo no encontrado")

type Vehicle struct {
	ID       string `json:"id"`
	DeviceID string `json:"device_id"` // enmascarado para no-admins
	Name     string `json:"name"`
}

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetAll(isAdmin bool) ([]Vehicle, error) {
	rows, err := s.db.Query(`SELECT id, device_id, name FROM vehicles`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vehicles []Vehicle
	for rows.Next() {
		var v Vehicle
		if err := rows.Scan(&v.ID, &v.DeviceID, &v.Name); err != nil {
			return nil, err
		}
		if !isAdmin {
			v.DeviceID = maskDeviceID(v.DeviceID) // ej: DEV-****-XC54
		}
		vehicles = append(vehicles, v)
	}
	return vehicles, nil
}

func (s *Service) Create(name, deviceID string) (*Vehicle, error) {
	v := &Vehicle{
		ID:       generateID(),
		DeviceID: deviceID,
		Name:     name,
	}
	_, err := s.db.Exec(
		`INSERT INTO vehicles (id, device_id, name) VALUES (?, ?, ?)`,
		v.ID, v.DeviceID, v.Name,
	)
	return v, err
}

// maskDeviceID convierte "DEV-A1B2-XC54" → "DEV-****-XC54"
func maskDeviceID(deviceID string) string {
	parts := strings.Split(deviceID, "-")
	if len(parts) != 3 {
		return "DEV-****-????"
	}
	return fmt.Sprintf("%s-****-%s", parts[0], parts[2])
}

func generateID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}
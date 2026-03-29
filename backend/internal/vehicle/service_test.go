package vehicle

import (
	"database/sql"
	"testing"

	_ "modernc.org/sqlite"
)

func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("error abriendo DB en memoria: %v", err)
	}

	_, err = db.Exec(`
		CREATE TABLE vehicles (
			id          TEXT PRIMARY KEY,
			device_id   TEXT UNIQUE NOT NULL,
			name        TEXT NOT NULL,
			created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		t.Fatalf("error creando tabla de prueba: %v", err)
	}

	return db
}

func TestService_Create(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	v, err := s.Create("Camión 1", "DEV-001-XXXX")
	if err != nil {
		t.Fatalf("error al crear vehículo: %v", err)
	}

	if v.Name != "Camión 1" {
		t.Errorf("nombre esperado Camión 1, obtenido %s", v.Name)
	}
	if v.ID == "" {
		t.Error("se esperaba un ID generado")
	}
}

func TestService_GetAll(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	deviceID := "DEV-A1B2-XC54"
	s.Create("Auto 1", deviceID)

	t.Run("Como Admin - Ver device_id real", func(t *testing.T) {
		vehicles, _ := s.GetAll(true)
		if len(vehicles) != 1 {
			t.Fatalf("se esperaba 1 vehículo, obtenidos %d", len(vehicles))
		}
		if vehicles[0].DeviceID != deviceID {
			t.Errorf("Admin debería ver %s, vio %s", deviceID, vehicles[0].DeviceID)
		}
	})

	t.Run("Como Usuario - Ver device_id enmascarado", func(t *testing.T) {
		vehicles, _ := s.GetAll(false)
		expectedMasked := "DEV-****-XC54"
		if vehicles[0].DeviceID != expectedMasked {
			t.Errorf("Usuario debería ver %s, vio %s", expectedMasked, vehicles[0].DeviceID)
		}
	})
}

func TestMaskDeviceID(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"DEV-A1B2-XC54", "DEV-****-XC54"},
		{"ABC-123-XYZ", "ABC-****-XYZ"},
		{"invalido", "DEV-****-????"},
		{"A-B", "DEV-****-????"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := maskDeviceID(tt.input)
			if result != tt.expected {
				t.Errorf("para %s: esperado %s, obtenido %s", tt.input, tt.expected, result)
			}
		})
	}
}

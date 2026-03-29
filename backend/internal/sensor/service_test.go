package sensor

import (
	"database/sql"
	"testing"
	"time"

	_ "modernc.org/sqlite"
	"backend-go/internal/alert"
)

type mockAlertService struct{}

func (m *mockAlertService) CheckAndCreate(vehicleID string, fuelAutonomy float64) (*alert.Alert, error) {
	return nil, nil
}

type mockBroadcaster struct{}

func (m *mockBroadcaster) Broadcast(event string, payload any) {}


func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("error abriendo DB en memoria: %v", err)
	}

	_, err = db.Exec(`
		CREATE TABLE sensor_readings (
			id            TEXT PRIMARY KEY,
			vehicle_id    TEXT NOT NULL,
			latitude      REAL,
			longitude     REAL,
			speed         REAL,
			fuel_level    REAL,
			fuel_autonomy REAL,
			temperature   REAL,
			recorded_at   DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		t.Fatalf("error creando tabla de prueba: %v", err)
	}

	return db
}

func TestService_Save(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db, &mockAlertService{}, &mockBroadcaster{})

	input := ReadingInput{
		VehicleID:   "v-123",
		Latitude:    -34.6037,
		Longitude:   -58.3816,
		Speed:       80.0,
		FuelLevel:   50.0,
		Temperature: 25.5,
	}

	reading, err := s.Save(input)
	if err != nil {
		t.Fatalf("error al guardar lectura: %v", err)
	}

	if reading.VehicleID != input.VehicleID {
		t.Errorf("VehicleID esperado %s, obtenido %s", input.VehicleID, reading.ID)
	}

	// Verificar autonomía calculada (50% / 10% por hora = 5 horas)
	expectedAutonomy := 5.0
	if reading.FuelAutonomy != expectedAutonomy {
		t.Errorf("Autonomía esperada %f, obtenida %f", expectedAutonomy, reading.FuelAutonomy)
	}

	// Verificar persistencia
	var count int
	db.QueryRow("SELECT COUNT(*) FROM sensor_readings").Scan(&count)
	if count != 1 {
		t.Errorf("Se esperaba 1 registro en la DB, se encontraron %d", count)
	}
}

func TestService_GetHistory(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db, &mockAlertService{}, &mockBroadcaster{})
	vehicleID := "car-99"

	// Insertar datos de prueba
	for i := 0; i < 5; i++ {
		s.Save(ReadingInput{
			VehicleID: vehicleID,
			Speed:     float64(i * 10),
			FuelLevel: 100,
		})
		time.Sleep(10 * time.Millisecond) // para que el timestamp sea distinto
	}

	t.Run("Obtener historial completo", func(t *testing.T) {
		history, err := s.GetHistory(vehicleID, 10)
		if err != nil {
			t.Fatalf("error al obtener historial: %v", err)
		}

		if len(history) != 5 {
			t.Errorf("Se esperaban 5 registros, obtenidos %d", len(history))
		}

		// Verificar orden descendente
		if history[0].Speed < history[1].Speed {
			t.Error("El historial no está ordenado por fecha descendente")
		}
	})

	t.Run("Respetar límite", func(t *testing.T) {
		history, _ := s.GetHistory(vehicleID, 2)
		if len(history) != 2 {
			t.Errorf("Se esperaban 2 registros por el límite, obtenidos %d", len(history))
		}
	})
}

func TestCalcFuelAutonomy(t *testing.T) {
	tests := []struct {
		name      string
		fuelLevel float64
		speed     float64
		expected  float64
	}{
		{"Detenido", 50.0, 0.0, 5.0},
		{"Velocidad base (80km/h)", 50.0, 80.0, 5.0},
		{"Doble velocidad (160km/h)", 50.0, 160.0, 2.5},
		{"Media velocidad (40km/h)", 50.0, 40.0, 10.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calcFuelAutonomy(tt.fuelLevel, tt.speed)
			if result != tt.expected {
				t.Errorf("esperado %f, obtenido %f", tt.expected, result)
			}
		})
	}
}

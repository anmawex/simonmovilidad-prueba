package alert

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
		CREATE TABLE alerts (
			id          TEXT PRIMARY KEY,
			vehicle_id  TEXT NOT NULL,
			type        TEXT NOT NULL,
			message     TEXT,
			resolved    INTEGER DEFAULT 0,
			created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		t.Fatalf("error creando tabla de prueba: %v", err)
	}

	return db
}

func TestService_CheckAndCreate(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	vehicleID := "v-alert-1"

	t.Run("Crear alerta por combustible bajo", func(t *testing.T) {
		alert, err := s.CheckAndCreate(vehicleID, 0.5) // 0.5 < 1.0 (threshold)
		if err != nil {
			t.Fatalf("error al crear alerta: %v", err)
		}

		if alert == nil {
			t.Fatal("se esperaba que se creara una alerta")
		}

		if alert.Type != "low_fuel" {
			t.Errorf("tipo de alerta esperado low_fuel, obtenido %s", alert.Type)
		}
	})

	t.Run("No crear alerta si autonomía es suficiente", func(t *testing.T) {
		alert, err := s.CheckAndCreate(vehicleID, 1.5) // 1.5 > 1.0
		if err != nil {
			t.Fatalf("error en CheckAndCreate: %v", err)
		}

		if alert != nil {
			t.Errorf("no se esperaba alerta, obtenida: %+v", alert)
		}
	})
}

func TestService_GetActiveAndResolve(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	vehicleID := "v-1"

	// insertar alertas directamente o usando s.CheckAndCreate
	s.CheckAndCreate(vehicleID, 0.5)
	s.CheckAndCreate(vehicleID, 0.4)

	t.Run("Obtener alertas activas", func(t *testing.T) {
		actives, err := s.GetActive()
		if err != nil {
			t.Fatalf("error obteniendo activas: %v", err)
		}

		if len(actives) != 2 {
			t.Errorf("se esperaban 2 alertas activas, obtenidas %d", len(actives))
		}
	})

	t.Run("Resolver alerta", func(t *testing.T) {
		actives, _ := s.GetActive()
		alertID := actives[0].ID

		err := s.Resolve(alertID)
		if err != nil {
			t.Fatalf("error al resolver alerta: %v", err)
		}

		// verificar que ya no sea activa
		newActives, _ := s.GetActive()
		if len(newActives) != 1 {
			t.Errorf("se esperaba 1 alerta activa después de resolver, obtenidas %d", len(newActives))
		}
	})
}

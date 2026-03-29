package vehicle

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend-go/internal/auth"
	"backend-go/pkg/jwt"
)

func TestHandler_GetAll(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	h := NewHandler(s)

	deviceID := "DEV-111-222"
	s.Create("V1", deviceID)

	t.Run("Como Admin", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/vehicles", nil)
		
		// inyectar claims de admin en el contexto
		ctx := context.WithValue(req.Context(), auth.ClaimsKey, &jwt.Claims{Role: "admin"})
		req = req.WithContext(ctx)
		
		rec := httptest.NewRecorder()

		h.GetAll(rec, req)

		var resp []Vehicle
		json.NewDecoder(rec.Body).Decode(&resp)
		
		if resp[0].DeviceID != deviceID {
			t.Errorf("Admin debería ver ID real, obtuvo %s", resp[0].DeviceID)
		}
	})

	t.Run("Como Usuario", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/vehicles", nil)
		
		// inyectar claims de usuario
		ctx := context.WithValue(req.Context(), auth.ClaimsKey, &jwt.Claims{Role: "user"})
		req = req.WithContext(ctx)
		
		rec := httptest.NewRecorder()

		h.GetAll(rec, req)

		var resp []Vehicle
		json.NewDecoder(rec.Body).Decode(&resp)
		
		if resp[0].DeviceID == deviceID {
			t.Error("Usuario NO debería ver ID real")
		}
	})
}

func TestHandler_Create(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	h := NewHandler(s)

	t.Run("Creación exitosa", func(t *testing.T) {
		payload := map[string]string{
			"name":      "New Truck",
			"device_id": "DEV-TRUCK-01",
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/api/vehicles", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.Create(rec, req)

		if rec.Code != http.StatusCreated {
			t.Errorf("se esperaba 201, obtenido %d", rec.Code)
		}

		var v Vehicle
		json.NewDecoder(rec.Body).Decode(&v)
		if v.Name != "New Truck" {
			t.Errorf("nombre esperado New Truck, obtenido %s", v.Name)
		}
	})
}

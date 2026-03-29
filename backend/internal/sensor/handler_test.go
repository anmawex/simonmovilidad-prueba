package sensor

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestHandler_SaveReading(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db, &mockAlertService{}, &mockBroadcaster{})
	h := NewHandler(s)

	t.Run("Lectura exitosa", func(t *testing.T) {
		payload := ReadingInput{
			VehicleID: "v-1",
			Speed:     100,
			FuelLevel: 80,
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/api/sensors/readings", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.SaveReading(rec, req)

		if rec.Code != http.StatusCreated {
			t.Errorf("se esperaba status 201, obtenido %d", rec.Code)
		}

		var resp Reading
		json.NewDecoder(rec.Body).Decode(&resp)
		if resp.ID == "" {
			t.Error("se esperaba un ID en la respuesta")
		}
	})

	t.Run("Falta vehicle_id", func(t *testing.T) {
		payload := ReadingInput{
			Speed: 100,
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/api/sensors/readings", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.SaveReading(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("se esperaba status 400, obtenido %d", rec.Code)
		}
	})
}

func TestHandler_GetHistory(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db, &mockAlertService{}, &mockBroadcaster{})
	h := NewHandler(s)

	// insertar datos
	s.Save(ReadingInput{VehicleID: "abc-123", Speed: 10})
	s.Save(ReadingInput{VehicleID: "abc-123", Speed: 20})

	t.Run("Obtener historial con id en URL", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/sensors/readings/abc-123", nil)
		
		// simular chi router para el parámetro URL
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("vehicleID", "abc-123")
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
		
		rec := httptest.NewRecorder()

		h.GetHistory(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba status 200, obtenido %d", rec.Code)
		}

		var resp []Reading
		json.NewDecoder(rec.Body).Decode(&resp)
		if len(resp) != 2 {
			t.Errorf("se esperaban 2 registros, obtenidos %d", len(resp))
		}
	})

	t.Run("Historial vacío para ID inexistente", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/sensors/readings/desconocido", nil)
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("vehicleID", "desconocido")
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
		
		rec := httptest.NewRecorder()

		h.GetHistory(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba 200, obtenido %d", rec.Code)
		}

		var resp []Reading
		json.NewDecoder(rec.Body).Decode(&resp)
		if len(resp) != 0 {
			t.Errorf("se esperaban 0 registros, obtenidos %d", len(resp))
		}
	})
}

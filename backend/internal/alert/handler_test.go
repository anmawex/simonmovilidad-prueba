package alert

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestHandler_GetActive(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	h := NewHandler(s)

	// insertar alerta
	s.CheckAndCreate("v1", 0.5)

	t.Run("Obtener alertas activas", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/alerts", nil)
		rec := httptest.NewRecorder()

		h.GetActive(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba 200, obtenido %d", rec.Code)
		}

		var resp []Alert
		json.NewDecoder(rec.Body).Decode(&resp)
		if len(resp) != 1 {
			t.Errorf("se esperaba 1 alerta, obtenidas %d", len(resp))
		}
	})
}

func TestHandler_Resolve(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	h := NewHandler(s)

	// insertar alerta y obtener su ID
	alert, _ := s.CheckAndCreate("v1", 0.5)
	alertID := alert.ID

	t.Run("Resolver alerta", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPatch, "/api/alerts/"+alertID+"/resolve", nil)
		
		// simular chi router para alertID
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("alertID", alertID)
		req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
		
		rec := httptest.NewRecorder()

		h.Resolve(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba 200, obtenido %d", rec.Code)
		}

		// verificar que ya no sea activa en el servicio
		actives, _ := s.GetActive()
		if len(actives) != 0 {
			t.Error("la alerta debería estar resuelta")
		}
	})
}

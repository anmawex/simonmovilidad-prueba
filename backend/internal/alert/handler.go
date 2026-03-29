package alert

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GET /api/alerts  (solo admin)
func (h *Handler) GetActive(w http.ResponseWriter, r *http.Request) {
	alerts, err := h.service.GetActive()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error obteniendo alertas")
		return
	}
	respondJSON(w, http.StatusOK, alerts)
}

// PATCH /api/alerts/{alertID}/resolve  (solo admin)
func (h *Handler) Resolve(w http.ResponseWriter, r *http.Request) {
	alertID := chi.URLParam(r, "alertID")
	if err := h.service.Resolve(alertID); err != nil {
		respondError(w, http.StatusInternalServerError, "error resolviendo alerta")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "alerta resuelta"})
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
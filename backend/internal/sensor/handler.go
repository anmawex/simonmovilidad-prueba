package sensor

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// POST /api/sensors/readings
func (h *Handler) SaveReading(w http.ResponseWriter, r *http.Request) {
	var input ReadingInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "body inválido")
		return
	}

	if input.VehicleID == "" {
		respondError(w, http.StatusBadRequest, "vehicle_id requerido")
		return
	}

	reading, err := h.service.Save(input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error guardando lectura")
		return
	}

	respondJSON(w, http.StatusCreated, reading)
}

// GET /api/sensors/readings/{vehicleID}?limit=50
func (h *Handler) GetHistory(w http.ResponseWriter, r *http.Request) {
	vehicleID := chi.URLParam(r, "vehicleID")
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil {
			limit = n
		}
	}

	readings, err := h.service.GetHistory(vehicleID, limit)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error obteniendo historial")
		return
	}

	respondJSON(w, http.StatusOK, readings)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
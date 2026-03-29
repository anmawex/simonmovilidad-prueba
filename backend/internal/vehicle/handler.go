package vehicle

import (
	"encoding/json"
	"net/http"

	"backend-go/internal/auth"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GET /api/vehicles
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	isAdmin := claims != nil && claims.Role == "admin"

	vehicles, err := h.service.GetAll(isAdmin)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error obteniendo vehículos")
		return
	}
	respondJSON(w, http.StatusOK, vehicles)
}

// POST /api/vehicles  (solo admin)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name     string `json:"name"`
		DeviceID string `json:"device_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondError(w, http.StatusBadRequest, "body inválido")
		return
	}

	v, err := h.service.Create(body.Name, body.DeviceID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "error creando vehículo")
		return
	}
	respondJSON(w, http.StatusCreated, v)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
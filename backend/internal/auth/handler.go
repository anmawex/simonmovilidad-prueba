package auth

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var input RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "body inválido")
		return
	}

	if input.Email == "" || input.Password == "" {
		respondError(w, http.StatusBadRequest, "email y password requeridos")
		return
	}

	if err := h.service.Register(input); err != nil {
		if errors.Is(err, ErrEmailTaken) {
			respondError(w, http.StatusConflict, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "error interno")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]string{"message": "usuario creado"})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "body inválido")
		return
	}

	resp, err := h.service.Login(input)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) || errors.Is(err, ErrWrongPassword) {
			respondError(w, http.StatusUnauthorized, "credenciales inválidas")
			return
		}
		respondError(w, http.StatusInternalServerError, "error interno")
		return
	}

	respondJSON(w, http.StatusOK, resp)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
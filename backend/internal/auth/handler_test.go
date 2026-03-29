package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestHandler_Register(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	s := NewService(db)
	h := NewHandler(s)

	t.Run("Registro exitoso", func(t *testing.T) {
		payload := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.Register(rec, req)

		if rec.Code != http.StatusCreated {
			t.Errorf("se esperaba status 201, obtenido %d", rec.Code)
		}
	})

	t.Run("Email ya registrado", func(t *testing.T) {
		payload := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.Register(rec, req)

		if rec.Code != http.StatusConflict {
			t.Errorf("se esperaba status 409, obtenido %d", rec.Code)
		}
	})
}

func TestHandler_Login(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	os.Setenv("JWT_SECRET", "secreto_de_prueba")
	s := NewService(db)
	h := NewHandler(s)

	// Crear un usuario primero
	s.Register(RegisterInput{
		Email:    "login@example.com",
		Password: "password123",
	})

	t.Run("Login exitoso", func(t *testing.T) {
		payload := map[string]string{
			"email":    "login@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.Login(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba status 200, obtenido %d", rec.Code)
		}

		var resp AuthResponse
		json.NewDecoder(rec.Body).Decode(&resp)
		if resp.Token == "" {
			t.Error("el token devuelto está vacío")
		}
	})

	t.Run("Credenciales inválidas", func(t *testing.T) {
		payload := map[string]string{
			"email":    "login@example.com",
			"password": "password_incorrecto",
		}
		body, _ := json.Marshal(payload)
		
		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.Login(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("se esperaba status 401, obtenido %d", rec.Code)
		}
	})
}

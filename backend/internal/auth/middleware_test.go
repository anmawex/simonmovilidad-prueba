package auth

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"backend-go/pkg/jwt"
)

func TestMiddleware_RequireAuth(t *testing.T) {
	os.Setenv("JWT_SECRET", "secreto_middleware")
	secret := "secreto_middleware"

	// Handler de prueba que simplemente responde OK si llega hasta aquí
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			t.Error("los claims deberían estar en el contexto")
		}
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, claims.UserID)
	})

	middleware := RequireAuth(testHandler)

	t.Run("Token válido", func(t *testing.T) {
		token, _ := jwt.Generate(jwt.Claims{
			UserID: "u123",
			Exp:    time.Now().Add(time.Hour).Unix(),
		}, secret)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()

		middleware.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba 200, obtenido %d", rec.Code)
		}
		if rec.Body.String() != "u123" {
			t.Errorf("UserID esperado u123, obtenido %s", rec.Body.String())
		}
	})

	t.Run("Sin token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()

		middleware.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("se esperaba 401, obtenido %d", rec.Code)
		}
	})

	t.Run("Token inválido", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", "Bearer token_falso")
		rec := httptest.NewRecorder()

		middleware.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("se esperaba 401, obtenido %d", rec.Code)
		}
	})
}

func TestMiddleware_RequireAdmin(t *testing.T) {
	os.Setenv("JWT_SECRET", "secreto_admin")
	secret := "secreto_admin"

	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := RequireAdmin(testHandler)

	t.Run("Admin exitoso", func(t *testing.T) {
		token, _ := jwt.Generate(jwt.Claims{
			UserID: "admin-1",
			Role:   "admin",
			Exp:    time.Now().Add(time.Hour).Unix(),
		}, secret)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()

		middleware.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("se esperaba 200, obtenido %d", rec.Code)
		}
	})

	t.Run("Usuario no admin", func(t *testing.T) {
		token, _ := jwt.Generate(jwt.Claims{
			UserID: "user-1",
			Role:   "user",
			Exp:    time.Now().Add(time.Hour).Unix(),
		}, secret)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()

		middleware.ServeHTTP(rec, req)

		if rec.Code != http.StatusForbidden {
			t.Errorf("se esperaba 403, obtenido %d", rec.Code)
		}
	})
}

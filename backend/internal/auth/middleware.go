package auth

import (
	"context"
	"net/http"
	"os"
	"strings"

	"backend-go/pkg/jwt"
)

type contextKey string

const ClaimsKey contextKey = "claims"

// RequireAuth valida el token en el header Authorization
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			respondError(w, http.StatusUnauthorized, "token requerido")
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwt.Validate(tokenStr, os.Getenv("JWT_SECRET"))
		if err != nil {
			respondError(w, http.StatusUnauthorized, err.Error())
			return
		}

		// inyectar claims en el contexto
		ctx := context.WithValue(r.Context(), ClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireAdmin valida que el usuario sea admin
func RequireAdmin(next http.Handler) http.Handler {
	return RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := r.Context().Value(ClaimsKey).(*jwt.Claims)
		if claims.Role != "admin" {
			respondError(w, http.StatusForbidden, "acceso denegado")
			return
		}
		next.ServeHTTP(w, r)
	}))
}

// GetClaims extrae los claims del contexto en cualquier handler
func GetClaims(r *http.Request) *jwt.Claims {
	claims, _ := r.Context().Value(ClaimsKey).(*jwt.Claims)
	return claims
}
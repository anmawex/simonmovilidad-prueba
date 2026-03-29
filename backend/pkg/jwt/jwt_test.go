package jwt

import (
	"testing"
	"time"
)

const testSecret = "mi_secreto_de_prueba"

func TestGenerate_y_Validate(t *testing.T) {
	claims := Claims{
		UserID: "user-123",
		Email:  "test@email.com",
		Role:   "admin",
		Exp:    time.Now().Add(1 * time.Hour).Unix(),
		Iat:    time.Now().Unix(),
	}

	token, err := Generate(claims, testSecret)
	if err != nil {
		t.Fatalf("Error generando token: %v", err)
	}

	recovered, err := Validate(token, testSecret)
	if err != nil {
		t.Fatalf("Error validando token: %v", err)
	}

	if recovered.UserID != claims.UserID {
		t.Errorf("UserID esperado %s, obtenido %s", claims.UserID, recovered.UserID)
	}
	if recovered.Role != claims.Role {
		t.Errorf("Role esperado %s, obtenido %s", claims.Role, recovered.Role)
	}
}

func TestValidate_TokenExpirado(t *testing.T) {
	claims := Claims{
		UserID: "user-123",
		Exp:    time.Now().Add(-1 * time.Hour).Unix(), // ya expiró
		Iat:    time.Now().Add(-2 * time.Hour).Unix(),
	}

	token, _ := Generate(claims, testSecret)
	_, err := Validate(token, testSecret)

	if err != ErrExpiredToken {
		t.Errorf("Se esperaba ErrExpiredToken, obtenido: %v", err)
	}
}

func TestValidate_FirmaInvalida(t *testing.T) {
	claims := Claims{
		UserID: "user-123",
		Exp:    time.Now().Add(1 * time.Hour).Unix(),
	}

	token, _ := Generate(claims, testSecret)
	_, err := Validate(token, "secreto_incorrecto")

	if err != ErrInvalidToken {
		t.Errorf("Se esperaba ErrInvalidToken, obtenido: %v", err)
	}
}

func TestValidate_TokenMalformado(t *testing.T) {
	_, err := Validate("esto.no.es.un.jwt.valido", testSecret)
	if err != ErrInvalidToken {
		t.Errorf("Se esperaba ErrInvalidToken, obtenido: %v", err)
	}
}
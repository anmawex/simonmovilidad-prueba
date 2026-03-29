package auth

import (
	"database/sql"
	"os"
	"testing"

	_ "modernc.org/sqlite"
)

func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("error abriendo DB en memoria: %v", err)
	}

	_, err = db.Exec(`
		CREATE TABLE users (
			id          TEXT PRIMARY KEY,
			email       TEXT UNIQUE NOT NULL,
			password    TEXT NOT NULL,
			role        TEXT NOT NULL DEFAULT 'user',
			created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		t.Fatalf("error creando tabla de prueba: %v", err)
	}

	return db
}

func TestService_RegisterAndLogin(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	os.Setenv("JWT_SECRET", "mi_secreto_super_seguro")
	s := NewService(db)

	email := "juan@example.com"
	pass := "secreto123"

	// probar registro
	err := s.Register(RegisterInput{
		Email:    email,
		Password: pass,
		Role:     "user",
	})
	if err != nil {
		t.Fatalf("error en Register: %v", err)
	}

	// probar registro duplicado
	err = s.Register(RegisterInput{
		Email:    email,
		Password: pass,
	})
	if err != ErrEmailTaken {
		t.Errorf("se esperaba error ErrEmailTaken, obtenido: %v", err)
	}

	// probar login
	resp, err := s.Login(LoginInput{
		Email:    email,
		Password: pass,
	})
	if err != nil {
		t.Fatalf("error en Login: %v", err)
	}

	if resp.Token == "" {
		t.Error("el token devuelto está vacío")
	}
	if resp.Role != "user" {
		t.Errorf("rol esperado user, obtenido %s", resp.Role)
	}

	// Probar login con contraseña incorrecta
	_, err = s.Login(LoginInput{
		Email:    email,
		Password: "password_mal",
	})
	if err != ErrWrongPassword {
		t.Errorf("se esperaba error ErrWrongPassword, obtenido: %v", err)
	}

	// probar login con usuario inexistente
	_, err = s.Login(LoginInput{
		Email:    "nadie@example.com",
		Password: pass,
	})
	if err != ErrUserNotFound {
		t.Errorf("se esperaba error ErrUserNotFound, obtenido: %v", err)
	}
}

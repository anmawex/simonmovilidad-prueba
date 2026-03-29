package auth

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"backend-go/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound    = errors.New("usuario no encontrado")
	ErrWrongPassword   = errors.New("contraseña incorrecta")
	ErrEmailTaken      = errors.New("email ya registrado")
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

type RegisterInput struct {
	Email    string
	Password string
	Role     string // "admin" | "user"
}

type LoginInput struct {
	Email    string
	Password string
}

type AuthResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}

func (s *Service) Register(input RegisterInput) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	id := generateID()
	role := "user"
	if input.Role == "admin" {
		role = "admin"
	}

	_, err = s.db.Exec(
		`INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)`,
		id, input.Email, string(hash), role,
	)
	if err != nil {
		return ErrEmailTaken
	}
	return nil
}

func (s *Service) Login(input LoginInput) (*AuthResponse, error) {
	var id, hashedPwd, role string
	err := s.db.QueryRow(
		`SELECT id, password, role FROM users WHERE email = ?`, input.Email,
	).Scan(&id, &hashedPwd, &role)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPwd), []byte(input.Password)); err != nil {
		return nil, ErrWrongPassword
	}

	claims := jwt.Claims{
		UserID: id,
		Email:  input.Email,
		Role:   role,
		Exp:    time.Now().Add(24 * time.Hour).Unix(),
		Iat:    time.Now().Unix(),
	}

	token, err := jwt.Generate(claims, os.Getenv("JWT_SECRET"))
	if err != nil {
		return nil, err
	}

	return &AuthResponse{Token: token, Role: role}, nil
}

func generateID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}
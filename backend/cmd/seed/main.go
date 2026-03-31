package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

func main() {
	godotenv.Load()

	db, err := sql.Open("sqlite", os.Getenv("DB_PATH"))
	if err != nil {
		log.Fatal("Error abriendo DB:", err)
	}
	defer db.Close()

	fmt.Println("Ejecutando seed")

	seedUsers(db)
	seedVehicles(db)

	fmt.Println("Seed completado")
}

func seedUsers(db *sql.DB) {
	users := []struct {
		id       string
		email    string
		password string
		role     string
	}{
		{"user-admin-001", "admin@simon.com", "admin123", "admin"},
		{"user-viewer-001", "viewer@simon.com", "viewer123", "user"},
	}

	for _, u := range users {
		hash, _ := bcrypt.GenerateFromPassword([]byte(u.password), bcrypt.DefaultCost)
		_, err := db.Exec(
			`INSERT OR IGNORE INTO users (id, email, password, role) VALUES (?, ?, ?, ?)`,
			u.id, u.email, string(hash), u.role,
		)
		if err != nil {
			log.Printf("  ⚠ Usuario %s ya existe, omitiendo\n", u.email)
		} else {
			fmt.Printf("  ✓ Usuario creado: %s (%s)\n", u.email, u.role)
		}
	}
}

func seedVehicles(db *sql.DB) {
	vehicles := []struct {
		id       string
		deviceID string
		name     string
	}{
		{"veh-001", "DEV-A1B2-XC54", "Camión 01"},
		{"veh-002", "DEV-C3D4-YZ89", "Camión 02"},
		{"veh-003", "DEV-E5F6-WV32", "Camioneta 01"},
	}

	for _, v := range vehicles {
		_, err := db.Exec(
			`INSERT OR IGNORE INTO vehicles (id, device_id, name) VALUES (?, ?, ?)`,
			v.id, v.deviceID, v.name,
		)
		if err != nil {
			log.Printf("Vehículo %s ya existe, omitiendo\n", v.name)
		} else {
			fmt.Printf("Vehículo creado: %s (%s)\n", v.name, v.deviceID)
		}
	}
}
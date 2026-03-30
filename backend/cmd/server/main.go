package main

import (
	"backend-go/internal/alert"
	"backend-go/internal/auth"
	"backend-go/internal/sensor"
	"backend-go/internal/vehicle"
	"backend-go/internal/ws"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	_ "modernc.org/sqlite"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, usando variables del sistema")
	}

	// Conectar a SQLite
	db, err := sql.Open("sqlite", os.Getenv("DB_PATH"))
	if err != nil {
		log.Fatal("Error abriendo DB:", err)
	}
	defer db.Close()

	// Ejecutar migraciones
	if err := runMigrations(db); err != nil {
		log.Fatal("Error en migraciones:", err)
	}

	// Services
	// Infrastructure & WebSocket Hub
	hub := ws.NewHub()

	// Services
	authService    := auth.NewService(db)
	alertService   := alert.NewService(db)
	sensorService  := sensor.NewService(db, alertService, hub)
	vehicleService := vehicle.NewService(db)

	// Handlers
	authHandler    := auth.NewHandler(authService)
	sensorHandler  := sensor.NewHandler(sensorService)
	alertHandler   := alert.NewHandler(alertService)
	vehicleHandler := vehicle.NewHandler(vehicleService)
	wsHandler      := ws.NewHandler(hub)


	// Router
	r := chi.NewRouter()
	
	// configuración de CORS para permitir solicitudes desde el frontend (puerto 3000)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, 
	}))

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Rutas públicas
	r.Post("/api/auth/register", authHandler.Register)
	r.Post("/api/auth/login",    authHandler.Login)
	r.Get("/ws", wsHandler.Connect)


	// Rutas autenticadas (cualquier usuario con token válido)
	r.Group(func(r chi.Router) {
		r.Use(auth.RequireAuth)

		r.Get("/api/me", func(w http.ResponseWriter, r *http.Request) {
			claims := auth.GetClaims(r)
			respondJSON(w, http.StatusOK, claims)
		})

		r.Get("/api/vehicles",                     vehicleHandler.GetAll)
		r.Post("/api/sensors/readings",             sensorHandler.SaveReading)
		r.Get("/api/sensors/readings/{vehicleID}",  sensorHandler.GetHistory)
	})

	// Rutas solo admin
	r.Group(func(r chi.Router) {
		r.Use(auth.RequireAdmin)

		r.Post("/api/vehicles",                  vehicleHandler.Create)
		r.Get("/api/alerts",                     alertHandler.GetActive)
		r.Patch("/api/alerts/{alertID}/resolve", alertHandler.Resolve)
	})

	port := os.Getenv("APP_PORT")
	fmt.Printf("Servidor corriendo en http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func runMigrations(db *sql.DB) error {
	migration, err := os.ReadFile("./db/migrations/001_init.sql")
	if err != nil {
		return err
	}
	_, err = db.Exec(string(migration))
	return err
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, map[string]string{"error": msg})
}
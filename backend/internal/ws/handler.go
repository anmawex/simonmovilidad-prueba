package ws

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // en producción validar el origen
	},
}

type Handler struct {
	hub *Hub
}

func NewHandler(hub *Hub) *Handler {
	return &Handler{hub: hub}
}

// GET /ws  — el frontend se conecta aquí
func (h *Handler) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "no se pudo hacer upgrade", http.StatusBadRequest)
		return
	}

	client := &Client{
		conn: conn,
		send: make(chan []byte, 32),
	}

	h.hub.register(client)
	defer h.hub.unregister(client)

	// escribe en goroutine separada
	go client.writePump()

	// mantiene la conexión viva leyendo mensajes del cliente
	// (ping/pong, o mensajes que el cliente pueda enviar)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break // cliente desconectado
		}
	}
}
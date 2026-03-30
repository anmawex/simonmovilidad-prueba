/**
 * WebSocket client for real-time telemetry updates.
 * Implementation will include event listeners and reconnect logic.
 */

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => console.log("WS connected");
    this.socket.onmessage = (event) => console.log("WS message", event.data);
    this.socket.onclose = () => console.log("WS disconnected");
  }

  disconnect() {
    this.socket?.close();
  }

  send(data: any) {
    this.socket?.send(JSON.stringify(data));
  }
}

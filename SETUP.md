# Guía de Despliegue Local - Backend

Esta guía explica cómo desplegar y ejecutar el backend de la aplicación de telemetría de vehículos localmente.

## Requisitos Previos

- **Go 1.26 o superior**: Asegúrate de tener Go instalado.
- **Git**: Para clonar el repositorio.

## Pasos de Despliegue

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd simonmovilidad-prueba
```

### 2. Navegar al Directorio del Backend

```bash
cd backend
```

### 3. Instalar Dependencias

Ejecuta el siguiente comando para descargar e instalar todas las dependencias del proyecto:

```bash
go mod tidy
```

### 4. Configurar Variables de Entorno

Copia el archivo `.env` existente o crea uno nuevo basado en él. El archivo contiene las configuraciones necesarias:

```bash
# Archivo .env
APP_PORT=8080
DB_PATH=./db/simon.db
ENV=development
```

- `APP_PORT`: Puerto en el que correrá el servidor (por defecto 8080).
- `DB_PATH`: Ruta a la base de datos SQLite.
- `ENV`: Entorno de ejecución.

### 5. Ejecutar Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente al iniciar el servidor. La base de datos SQLite se creará en la ruta especificada en `DB_PATH` si no existe.

### 6. Crear Datos por Defecto (Seed)

Para poblar la base de datos con datos iniciales (usuarios y vehículos de ejemplo), ejecuta el comando de seed:

```bash
go run cmd/seed/main.go
```

Esto creará:

- **Usuarios**:
  - Admin: `admin@simon.com` / `admin123` (rol: admin)
  - Viewer: `viewer@simon.com` / `viewer123` (rol: user)
- **Vehículos**:
  - Camión 01 (DEV-A1B2-XC54)
  - Camión 02 (DEV-C3D4-YZ89)
  - Camioneta 01 (DEV-E5F6-WV32)

### 7. Ejecutar el Servidor

Inicia el servidor backend con:

```bash
go run cmd/server/main.go
```

El servidor estará disponible en `http://localhost:8080`. Verás un mensaje confirmando que el servidor está corriendo.

### 8. Verificar el Despliegue

- **Health Check**: Visita `http://localhost:8080/health` para verificar que el servidor esté funcionando. Deberías ver `{"status":"ok"}`.
- **API Endpoints**: Puedes probar las rutas públicas como login o WebSocket.

## Notas Adicionales

- La base de datos SQLite se crea automáticamente en `./db/simon.db` si no existe.
- Si encuentras errores relacionados con permisos o rutas, asegúrate de que el directorio `./db` tenga permisos de escritura.
- Para detener el servidor, usa `Ctrl+C` en la terminal.

## Solución de Problemas

- **Error de conexión a DB**: Verifica que la ruta en `DB_PATH` sea correcta y que tengas permisos para escribir en ese directorio.
- **Puerto ocupado**: Cambia `APP_PORT` en el `.env` si el puerto 8080 está en uso.
- **Dependencias faltantes**: Asegúrate de ejecutar `go mod tidy` después de clonar.

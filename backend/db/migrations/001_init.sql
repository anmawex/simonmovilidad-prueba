CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,         -- bcrypt hash
    role        TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id          TEXT PRIMARY KEY,
    device_id   TEXT UNIQUE NOT NULL,  -- el ID real (ej: DEV-A1B2-XC54)
    name        TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id            TEXT PRIMARY KEY,
    vehicle_id    TEXT NOT NULL,
    latitude      REAL,
    longitude     REAL,
    speed         REAL,
    fuel_level    REAL,               -- porcentaje 0-100
    fuel_autonomy REAL,               -- horas restantes calculadas
    temperature   REAL,
    recorded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id          TEXT PRIMARY KEY,
    vehicle_id  TEXT NOT NULL,
    type        TEXT NOT NULL,        -- 'low_fuel' | 'high_temp' | etc
    message     TEXT,
    resolved    INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
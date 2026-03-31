# Decisiones de Diseño y Arquitectura (DESIGN.md)

Este documento detalla las elecciones técnicas y arquitectónicas tomadas durante el desarrollo de la prueba técnica para el sistema de telemetría y sensores IoT de vehículos. Las decisiones buscan un balance entre simplicidad, rendimiento, mantenibilidad y los requisitos propuestos de la prueba.

---

## 1. Elección del Stack Tecnológico

La pila tecnológica se ha seleccionado centrándose en el pragmatismo, minimizando dependencias innecesarias y maximizando el rendimiento del servicio final.

- **Lenguaje base: Go (Golang) 1.26**
  - **Razón:** Go compila a un único binario altamente optimizado sin necesidad de máquina virtual, es extremadamente rápido y eficiente en consumo de memoria. Su modelo de concurrencia nativo (Goroutines) lo hace el lenguaje ideal para un servicio que en el futuro podría procesar la ingesta concurrente de múltiples sensores de vehículos IoT en tiempo real.

- **Enrutador HTTP: Chi (`github.com/go-chi/chi/v5`)**
  - **Razón:** En lugar de frameworks completos y pesados (como _Gin_, _Fiber_ o _Echo_), `Chi` es un enrutador minimalista que se adhiere 100% a la interfaz estándar de Go (`net/http`). Esto asegura que el código sea idiomático, compatible, ligero y rápido; permitiendo crear middlewares y grupos de rutas sin acoplarse al ecosistema privado de un framework en particular.

- **Base de Datos: SQLite puro en Go (`modernc.org/sqlite`)**
  - **Razón:** Para cumplir con el propósito de la prueba técnica sin forzar la dependencia de infraestructura extrema, se ha optado por SQLite. Específicamente, este puerto de SQLite no requiere CGO (compilador de C), lo que permite compilar este proyecto instantáneamente de manera cruzada entre Windows, Mac y Linux.

- **Seguridad y Criptografía:**
  - **Razón:** Se usó `golang.org/x/crypto/bcrypt`, que es el estándar de la industria robusto y seguro para el hashing de contraseñas. Para los tokens, elegimos una implementación casera libre de dependencias de **JWT HMAC-SHA256**. Esto mantuvo la superficie de ataque y el tamaño del proyecto lo más pequeño posible, demostrando además un claro entendimiento del funcionamiento de la especificación JWT por debajo.

---

## 2. Decisiones Arquitectónicas

Se ha aplicado un diseño inspirado en el estándar de la comunidad (Standard Go Project Layout) y organizado de forma "Vertical Slicing" (cortes verticales).

- `cmd/server/main.go`: El punto de entrada exclusivo. Inyecta dependencias, conecta a la BD e inicia el servidor HTTP.
- `pkg/`: Utilidades genéricas e independientes del dominio (ej. `pkg/jwt`).
- `internal/`: Lógica de dominio agnóstica o aislada que no debe compartirse. Se divide en módulos verticales: `auth`, `vehicle`, `sensor` y `alert`.
  - **Patrón Handler-Service:** Cada módulo cuenta con un `service.go` encapsulando la lógica de negocio (y consultas a BD), acoplado a un `handler.go` que maneja el HTTP, parseo y respuestas.

---

## 3. Principales Trade-offs Técnicos (Compromisos)

Para la prueba técnica se tuvieron que elegir decisiones prácticas que conllevan ciertos sacrificios con respecto a una aplicación real a escala masiva industrial:

### A. Simplicidad de DB (SQLite) vs. Alta Concurrencia de Escritura (PostgreSQL)

- **El compromiso:** Se optó por la facilidad de instalación y agilidad en las pruebas unitarias (`:memory:`) obteniendo una base de datos ligera embebida dentro de la propia app.
- **El sacrificio:** SQLite brilla en lectura concurrente técnica, pero presenta bloqueos a nivel de archivo completo al escribir. En una situación real donde miles de vehículos manden reportes en el mismo milisegundo, sufriría contención (Write-Lock). Si el volumen de datos escala, se asume la inevitable refactorización para acoplar `PostgreSQL` o bases de datos orientadas a series de tiempo.

### B. Inyección Directa de SQl vs. Patrón de Repositorio Completo

- **El compromiso:** Inyectar directamente el pool `*sql.DB` en los `Services` aceleró dramáticamente la creación del código de dominio, siendo muy pragmático.
- **El sacrificio:** Se pierde abstracción. Si mañana se desea intercambiar SQL por NoSQL (ej. MongoDB), implicará rescrituras costosas ya que la persistencia está emparejada junto con las reglas de negocio (ej. validaciones de autonomía). Las interfaces se dejaron de lado a cambio de no complicar la prueba técnica injustificadamente dadas sus condiciones.

### C. Framework Minimalista vs. Abstracciones de Alto Nivel

- **El compromiso:** Usar la librería estandar con `Chi` nos da absoluto control sobre los structs, JSON parsing e inyección de datos contextuales en cabeceras HTTP.
- **El sacrificio:** Hubo que implementar manualmente la serialización repetitiva de utilidades (las funciones `respondJSON` y `respondError`) y validaciones exhaustivas de tipos e inputs de usuario, lo cual hubiera venido gratis mediante **tags mágicos (`binding`)** al usar componentes de Gin o frameworks pesados.

### D. JWT Casero y Stateless vs. Control Exhaustivo de Sesiones

- **El compromiso:** Implementar nuestros JWT limitó las dependencias estrictamente a una. El token encapsula la propia carga probatoria y asegura que las lecturas a recursos protegidos a nivel API (por ejemplo `GetActive`) cuesten 0 _queries_ en lectura de acceso a la DB.
- **El sacrificio:** Al ser validadores matemáticos totalmente independientes de la BD ("stateless"), actualmente es imposible cancelar o _revocar manualmente_ un token comprometido, o forzar desloguear a alguien remotamente antes de que expiren sus `claims` a las 24 hrs. En modelos críticos, se requiere añadir listas negras (Redis o DB) que vuelven el JWT con estado.

---

## 4. Elección del Stack Tecnológico - Frontend

El frontend se ha desarrollado con un enfoque en la simplicidad, rendimiento y compatibilidad con el backend, utilizando tecnologías modernas y ligeras para una aplicación web responsiva y en tiempo real.

- **Framework: Next.js 16**
  - **Razón:** Next.js proporciona una experiencia de desarrollo fluida con App Router, optimización automática de imágenes y bundling, y soporte nativo para TypeScript. Permite renderizado híbrido (client-side y server-side), pero en este caso se priorizó client-side rendering para interacciones en tiempo real.

- **Lenguaje: TypeScript**
  - **Razón:** TypeScript añade tipado estático, mejorando la mantenibilidad y reduciendo errores en tiempo de desarrollo.

- **UI y Estilos: Tailwind CSS**
  - **Razón:** Tailwind ofrece utilidades CSS rápidas y consistentes sin necesidad de archivos CSS personalizados extensos.

- **Gráficos: Chart.js con react-chartjs-2**
  - **Razón:** Chart.js es una librería ligera y flexible para visualizaciones de datos. Se integra fácilmente con React y soporta gráficos responsivos para velocidad y combustible.

- **Mapas: MapLibre GL**
  - **Razón:** MapLibre es una alternativa open-source gratuita y sin límites de uso. Proporciona mapas interactivos eficientes para mostrar ubicaciones de vehículos en tiempo real.

- **Estado y Comunicación:**
  - **API Client:** Implementación personalizada con fetch para simplicidad y control, sin dependencias externas como Axios.
  - **WebSocket:** Conexión nativa para actualizaciones en tiempo real de sensores y alertas.
  - **Cache:** Combinación de localStorage para datos simples (auth) e IndexedDB para datos complejos (lecturas de sensores, alertas), permitiendo funcionalidad offline básica.

---

## 5. Decisiones Arquitectónicas - Frontend

El frontend sigue una arquitectura basada en componentes y hooks personalizados, inspirada en las mejores prácticas de React.

- **Estructura de Carpetas:** Organizada por features (`components/alerts`, `hooks/useVehicles`), facilitando la escalabilidad y separación de responsabilidades.
- **Hooks Personalizados:** Encapsulan lógica de negocio (autenticación, WebSocket, cache), promoviendo reutilización y testabilidad.
- **Componentes:** Funcionales con 'use client' para interacciones dinámicas, usando CSS Modules para estilos locales.
- **Renderizado:** Client-side rendering para aplicaciones en tiempo real, con lazy loading implícito en Next.js.

---

## 6. Principales Trade-offs Técnicos - Frontend (Compromisos)

### A. Next.js Client-Side Rendering vs. Server-Side Rendering

- **El compromiso:** Se optó por client-side rendering para interacciones en tiempo real (WebSocket, mapas dinámicos), simplificando el desarrollo y reduciendo carga en el servidor.
- **El sacrificio:** Pierde beneficios de SEO y tiempos de carga inicial más rápidos que SSR. En una app pública, se requeriría migrar a SSR para mejor indexación.

### B. Tailwind CSS

- **El compromiso:** Tailwind acelera el desarrollo con clases utilitarias, manteniendo el bundle pequeño mediante purga.
- **El sacrificio:** Puede llevar a HTML verboso y menos reutilización de componentes estilizados. Para equipos grandes, una librería como Chakra UI ofrecería más consistencia y temas.

### C. Cache Simple (localStorage + IndexedDB)

- **El compromiso:** Implementaciones personalizadas reducen dependencias y complejidad, usando APIs nativas del navegador para offline básico.
- **El sacrificio:** Menos robusto que soluciones como Redux Toolkit o SWR para invalidación automática de cache y sincronización. En apps complejas, podría causar inconsistencias de datos.

### D. WebSocket Nativo

- **El compromiso:** WebSocket puro mantiene el bundle ligero y directo control sobre la conexión.
- **El sacrificio:** Falta manejo automático de reconexiones y fallos en algunos navegadores. Socket.io proporcionaría más fiabilidad a costa de tamaño.

### E. Sin Estado Global Centralizado

- **El compromiso:** Estado manejado en hooks locales simplifica el código para una app pequeña.
- **El sacrificio:** Dificulta compartir estado entre componentes distantes. Para escalabilidad, se necesitaría un store global.

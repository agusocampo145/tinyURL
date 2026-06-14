# TinyURL

Sistema de acortamiento de URLs con registro asincrónico de accesos y estadísticas.

## Tecnologías

- **Node.js** + **TypeScript**
- **Express** — framework HTTP
- **MongoDB** + **Mongoose** — persistencia principal
- **Redis** — caché de resolución de URLs
- **BullMQ** — cola de mensajes para procesamiento asincrónico
- **Docker** + **Docker Compose** — orquestación del entorno
- **Jest** + **Supertest** — tests unitarios e integración

## Arquitectura
src/   
├── controllers/ # Manejo de requests y responses  
├── services/ # Lógica de negocio  
├── repositories/ # Acceso a datos (MongoDB)  
├── middlewares/ # Validaciones   
├── models/ # Esquemas Mongoose   
├── queues/ # Definición y worker de BullMQ  
├── routes/ # Definición de endpoints  
├── types/ # Tipos TypeScript   
├── utils/ # Helpers  
├── app.ts  
└── server.ts  


El proyecto sigue una arquitectura en capas **Controller → Service → Repository**, manteniendo separadas las responsabilidades y facilitando el testing.

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/urls` | Crear una TinyURL |
| `GET` | `/:code` | Resolver y redirigir |
| `GET` | `/api/urls/:code/stats` | Ver estadísticas de acceso |

### Crear TinyURL

```json
POST /api/urls
{
  "originalUrl": "https://www.google.com/search?q=nodejs",
  "alias": "mi-alias"
}
```

El campo alias es opcional. Si no se envía, se genera un código aleatorio.

### Respuesta
```json
{
  "shortUrl": "http://localhost:3000/mi-alias"
}
```

### Estadisticas (Stats)
```json
GET /api/urls/mi-alias/stats

{
  "code": "mi-alias",
  "totalClicks": 125,
  "lastClick": "2026-06-10T18:20:15Z"
}

```
## Decisiones tecnicas
### BullMQ como cola de mensajes  
Se evaluaron distintas opciones para el procesamiento asincrónico de eventos (RabbitMQ, Bull, BullMQ).   
Se optó por BullMQ porque:  
Se integra nativamente con Redis, que ya forma parte del stack, evitando incorporar nueva infraestructura.
Ofrece soporte nativo de TypeScript.
Provee reintentos automáticos, manejo de fallos y monitoreo de jobs de forma simple.
Es la evolución activa de Bull, con mejor arquitectura y mantenimiento activo.

### Redis como caché
Se utiliza Redis para cachear la resolución de TinyURLs, reduciendo la carga sobre MongoDB en el caso más frecuente (redirección).

### Separación en capas
Se adoptó una arquitectura Controller → Service → Repository para mantener el código organizado, testeable y con responsabilidades claras.

## Instalación y uso
### Requisitos:  
Docker  
Docker Compose

Pasos:
## 1. Clonar el repositorio
```
git clone <url-del-repo>
cd tinyURL
```

## 2. Levantar el entorno
```
docker compose up --build
```

## 3. Acceder a la aplicación
```
http://localhost:3000
```

El archivo .env está incluido en el repositorio ya que no contiene datos sensibles, solo configuración de puertos por defecto.

### Tests
```
# Instalar dependencias localmente
npm install

# Ejecutar tests
npm test
```

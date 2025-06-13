# 📡 Documentación de APIs

## Tabla de Contenidos
- [Introducción](#introducción)
- [User Service API](#user-service-api)
- [Order Service API](#order-service-api)
- [Códigos de Estado](#códigos-de-estado)
- [Ejemplos Completos](#ejemplos-completos)
- [Postman Collection](#postman-collection)

## Introducción

Este documento detalla todos los endpoints disponibles en el sistema de microservicios. Cada servicio expone su documentación Swagger en `/api/docs`.

### URLs Base
- **User Service**: `http://localhost:3001`
- **Order Service**: `http://localhost:3002`

### Documentación Swagger
- **User Service**: http://localhost:3001/api/docs
- **Order Service**: http://localhost:3002/api/docs

## User Service API

### 🔐 Autenticación

#### POST /auth/register
Registra un nuevo usuario y devuelve un token JWT.

**Request Body:**
```json
{
  "name": "string (required, min: 2, max: 100)",
  "email": "string (required, valid email)",
  "password": "string (required, min: 6)"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Usuario Ejemplo",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `400` - Datos de entrada inválidos
- `409` - El usuario con este email ya existe

---

#### POST /auth/login
Autentica un usuario existente.

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Usuario Ejemplo",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `401` - Credenciales inválidas

---

#### GET /auth/me
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Usuario Ejemplo",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errores:**
- `401` - Token inválido o no proporcionado

### 👥 Usuarios

#### POST /users
Registra un nuevo usuario (sin token).

**Request Body:**
```json
{
  "name": "string (required, min: 2, max: 100)",
  "email": "string (required, valid email)",
  "password": "string (required, min: 6)"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Usuario Ejemplo",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Order Service API

### 📦 Pedidos

Todos los endpoints de pedidos requieren autenticación JWT.

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### POST /orders
Crea un nuevo pedido.

**Request Body:**
```json
{
  "orderItems": [
    {
      "productId": "string (required)",
      "quantity": "number (required, min: 1)",
      "price": "number (required, min: 0.01)"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "PENDING",
  "totalAmount": 59.98,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "orderItems": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "productId": "product-123",
      "quantity": 2,
      "price": 29.99,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Errores:**
- `400` - Datos inválidos o usuario no válido
- `401` - Token de autenticación requerido

---

#### GET /orders
Lista todos los pedidos del usuario autenticado.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "status": "PENDING",
    "totalAmount": 59.98,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "orderItems": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "product-123",
        "quantity": 2,
        "price": 29.99,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

**Errores:**
- `401` - Token de autenticación requerido

---

#### PATCH /orders/:id
Actualiza el estado de un pedido específico.

**Path Parameters:**
- `id`: UUID del pedido

**Request Body:**
```json
{
  "status": "IN_PROCESS | COMPLETED"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "IN_PROCESS",
  "totalAmount": 59.98,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "orderItems": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "productId": "product-123",
      "quantity": 2,
      "price": 29.99,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Estados válidos:**
- `PENDING` → `IN_PROCESS`
- `IN_PROCESS` → `COMPLETED`

**Errores:**
- `400` - Transición de estado inválida
- `401` - Token de autenticación requerido
- `404` - Pedido no encontrado

## Códigos de Estado

### Códigos de Éxito
- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente

### Códigos de Error del Cliente
- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Autenticación requerida o inválida
- `403` - Forbidden: Sin permisos para acceder al recurso
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con el estado actual del recurso

### Códigos de Error del Servidor
- `500` - Internal Server Error: Error interno del servidor
- `503` - Service Unavailable: Servicio temporalmente no disponible

## Ejemplos Completos

### Flujo Completo de Usuario y Pedido

#### 1. Registrar Usuario
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "password": "MiPassword123!"
  }'
```

#### 2. Crear Pedido
```bash
# Usar el token obtenido en el paso anterior
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "orderItems": [
      {
        "productId": "laptop-dell-123",
        "quantity": 1,
        "price": 899.99
      },
      {
        "productId": "mouse-logitech-456",
        "quantity": 2,
        "price": 25.50
      }
    ]
  }'
```

#### 3. Listar Pedidos
```bash
curl -X GET http://localhost:3002/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 4. Actualizar Estado del Pedido
```bash
curl -X PATCH http://localhost:3002/orders/order-uuid-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "status": "IN_PROCESS"
  }'
```

## Postman Collection

### Configuración de Variables
```json
{
  "user_service_url": "http://localhost:3001",
  "order_service_url": "http://localhost:3002",
  "access_token": "{{access_token}}"
}
```

### Pre-request Script para Autenticación
```javascript
// Obtener token si no existe
if (!pm.globals.get("access_token")) {
    pm.sendRequest({
        url: pm.globals.get("user_service_url") + "/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "test@example.com",
                password: "password123"
            })
        }
    }, function (err, res) {
        if (res && res.json() && res.json().access_token) {
            pm.globals.set("access_token", res.json().access_token);
        }
    });
}
```

### Test Scripts
```javascript
// Verificar respuesta exitosa
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Guardar token para siguientes requests
if (pm.response.json() && pm.response.json().access_token) {
    pm.globals.set("access_token", pm.response.json().access_token);
}

// Verificar estructura de respuesta
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('createdAt');
});
```

---

[← Volver al README principal](../README.md) | [Siguiente: RabbitMQ y Mensajería →](./MESSAGING.md) 
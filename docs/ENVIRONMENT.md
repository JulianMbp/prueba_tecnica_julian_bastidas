# 🔧 Variables de Entorno

## Tabla de Contenidos
- [Introducción](#introducción)
- [Variables por Servicio](#variables-por-servicio)
- [Configuración por Entorno](#configuración-por-entorno)
- [Seguridad](#seguridad)
- [Ejemplos de Configuración](#ejemplos-de-configuración)

## Introducción

Este documento detalla todas las variables de entorno utilizadas en el sistema de microservicios. Las variables están organizadas por servicio y entorno.

## Variables por Servicio

### 🔐 User Service

#### Variables Requeridas

| Variable | Descripción | Tipo | Ejemplo |
|----------|-------------|------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Clave secreta para JWT | string | `your-super-secret-key` |
| `RABBITMQ_URL` | URL de conexión a RabbitMQ | string | `amqp://user:pass@host:port` |
| `PORT` | Puerto del servicio | number | `3001` |

#### Variables Opcionales

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |
| `JWT_EXPIRES_IN` | Tiempo de expiración JWT | `1h` | `24h` |
| `JWT_ISSUER` | Emisor del token JWT | `user-service` | `my-app` |
| `JWT_AUDIENCE` | Audiencia del token JWT | `ecommerce-app` | `my-users` |
| `LOG_LEVEL` | Nivel de logging | `info` | `debug` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` | `http://localhost:3000` |

### 📦 Order Service

#### Variables Requeridas

| Variable | Descripción | Tipo | Ejemplo |
|----------|-------------|------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Clave secreta para JWT (debe coincidir con User Service) | string | `your-super-secret-key` |
| `RABBITMQ_URL` | URL de conexión a RabbitMQ | string | `amqp://user:pass@host:port` |
| `PORT` | Puerto del servicio | number | `3002` |

#### Variables Opcionales

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |
| `LOG_LEVEL` | Nivel de logging | `info` | `debug` |
| `USER_SERVICE_URL` | URL del User Service | `http://localhost:3001` | `http://user-service:3001` |

### 🗄️ PostgreSQL

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` | `ecommerce_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | - | `secure_password_123` |
| `POSTGRES_DB` | Base de datos principal | `postgres` | `ecommerce` |

### 🐰 RabbitMQ

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `RABBITMQ_DEFAULT_USER` | Usuario de RabbitMQ | `guest` | `rabbit` |
| `RABBITMQ_DEFAULT_PASS` | Contraseña de RabbitMQ | `guest` | `secure_password_123` |

### 🔧 pgAdmin

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `PGADMIN_DEFAULT_EMAIL` | Email de acceso | - | `admin@admin.com` |
| `PGADMIN_DEFAULT_PASSWORD` | Contraseña de acceso | - | `admin_password` |
| `PGADMIN_CONFIG_SERVER_MODE` | Modo servidor | `True` | `False` |

## Configuración por Entorno

### 🔧 Desarrollo (Development)

#### user-service/.env
```env
# Base de datos
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/users_db?schema=public"

# RabbitMQ
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"

# JWT
JWT_SECRET="S3cr3t k3y*"
JWT_EXPIRES_IN="1h"
JWT_ISSUER="user-service"
JWT_AUDIENCE="ecommerce-app"

# Servidor
PORT=3001
NODE_ENV=development

# Logs
LOG_LEVEL=debug

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### order-service/.env
```env
# Base de datos
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/orders_db?schema=public"

# RabbitMQ
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"

# JWT (debe coincidir con User Service)
JWT_SECRET="S3cr3t k3y*"

# Servidor
PORT=3002
NODE_ENV=development

# Logs
LOG_LEVEL=debug

# Servicios
USER_SERVICE_URL="http://localhost:3001"
```

### 🚀 Producción (Production)

#### user-service/.env.production
```env
# Base de datos
DATABASE_URL="postgresql://prod_user:${DB_PASSWORD}@db.example.com:5432/users_db?schema=public&sslmode=require"

# RabbitMQ
RABBITMQ_URL="amqps://prod_user:${RABBITMQ_PASSWORD}@rabbitmq.example.com:5671"

# JWT
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="15m"
JWT_ISSUER="ecommerce-user-service"
JWT_AUDIENCE="ecommerce-production"

# Servidor
PORT=3001
NODE_ENV=production

# Logs
LOG_LEVEL=warn

# CORS
CORS_ORIGIN="https://myapp.com"
```

#### order-service/.env.production
```env
# Base de datos
DATABASE_URL="postgresql://prod_user:${DB_PASSWORD}@db.example.com:5432/orders_db?schema=public&sslmode=require"

# RabbitMQ
RABBITMQ_URL="amqps://prod_user:${RABBITMQ_PASSWORD}@rabbitmq.example.com:5671"

# JWT
JWT_SECRET="${JWT_SECRET}"

# Servidor
PORT=3002
NODE_ENV=production

# Logs
LOG_LEVEL=warn

# Servicios
USER_SERVICE_URL="https://user-service.example.com"
```

### 🧪 Testing

#### .env.test
```env
# Base de datos de pruebas
DATABASE_URL="postgresql://postgres:test@localhost:5433/test_users_db?schema=public"

# RabbitMQ de pruebas
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# JWT para tests
JWT_SECRET="test-secret-key"
JWT_EXPIRES_IN="1h"

# Servidor
PORT=0  # Puerto aleatorio
NODE_ENV=test

# Logs
LOG_LEVEL=error
```

## Seguridad

### 🔒 Mejores Prácticas

#### 1. Nunca Hardcodear Secretos

❌ **Incorrecto:**
```typescript
const jwtSecret = "my-secret-key";
```

✅ **Correcto:**
```typescript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}
```

#### 2. Usar Variables de Entorno Específicas

❌ **Incorrecto:**
```env
SECRET=my-secret
```

✅ **Correcto:**
```env
JWT_SECRET=my-jwt-secret
DB_PASSWORD=my-db-password
RABBITMQ_PASSWORD=my-rabbitmq-password
```

#### 3. Validar Variables Requeridas

```typescript
// config/environment.ts
export const config = {
  database: {
    url: process.env.DATABASE_URL || (() => {
      throw new Error('DATABASE_URL is required');
    })(),
  },
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET is required');
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  server: {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
```

### 🔐 Generación de Secretos Seguros

#### JWT Secret
```bash
# Generar clave segura para JWT
openssl rand -base64 32

# Ejemplo de salida:
# 9s2YIsC4yCdUaEldurGYf1PZ+BpIAPB8xgxxwQcfnBw=
```

#### Contraseñas de Base de Datos
```bash
# Generar contraseña segura
openssl rand -base64 24

# O usar herramientas online seguras
# https://passwordsgenerator.net/
```

### 🔒 Gestión de Secretos en Producción

#### Docker Secrets
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  user-service:
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

#### Kubernetes Secrets
```yaml
# k8s-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  db-password: <base64-encoded-password>
```

## Ejemplos de Configuración

### 📋 Archivo .env Completo

#### user-service/.env
```env
#######################
# DATABASE
#######################
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/users_db?schema=public"

#######################
# RABBITMQ
#######################
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"

#######################
# JWT CONFIGURATION
#######################
JWT_SECRET="9s2YIsC4yCdUaEldurGYf1PZ+BpIAPB8xgxxwQcfnBw="
JWT_EXPIRES_IN="1h"
JWT_ISSUER="user-service"
JWT_AUDIENCE="ecommerce-app"

#######################
# SERVER CONFIGURATION
#######################
PORT=3001
NODE_ENV=development

#######################
# LOGGING
#######################
LOG_LEVEL=debug

#######################
# CORS
#######################
CORS_ORIGIN="http://localhost:3000"

#######################
# RATE LIMITING
#######################
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

#######################
# HEALTH CHECK
#######################
HEALTH_CHECK_TIMEOUT=5000
```

### 🐳 Docker Compose con Variables

```yaml
# docker-compose.yml
version: '3.8'

services:
  user-service:
    build: ./user-service
    environment:
      # Base de datos
      DATABASE_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/users_db?schema=public"
      
      # RabbitMQ
      RABBITMQ_URL: "amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672"
      
      # JWT
      JWT_SECRET: "${JWT_SECRET}"
      JWT_EXPIRES_IN: "${JWT_EXPIRES_IN:-1h}"
      
      # Servidor
      PORT: 3001
      NODE_ENV: "${NODE_ENV:-production}"
      
      # Logs
      LOG_LEVEL: "${LOG_LEVEL:-info}"
    env_file:
      - .env
      - .env.local
```

### 📝 Script de Validación

```bash
#!/bin/bash
# scripts/validate-env.sh

echo "🔍 Validando variables de entorno..."

# Variables requeridas
REQUIRED_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "RABBITMQ_URL"
  "POSTGRES_PASSWORD"
  "RABBITMQ_DEFAULT_PASS"
)

# Verificar cada variable
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: Variable $var no está definida"
    exit 1
  else
    echo "✅ $var está definida"
  fi
done

# Verificar longitud de JWT_SECRET
if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "⚠️  Advertencia: JWT_SECRET debería tener al menos 32 caracteres"
fi

echo "🎉 Todas las variables están configuradas correctamente"
```

---

[← Volver al README principal](../README.md) | [Siguiente: Arquitectura →](./ARCHITECTURE.md) 
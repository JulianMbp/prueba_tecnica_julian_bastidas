# 🚀 Instalación y Configuración

## Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [Instalación Rápida](#instalación-rápida)
- [Configuración Detallada](#configuración-detallada)
- [Verificación de la Instalación](#verificación-de-la-instalación)
- [Troubleshooting](#troubleshooting)

## Requisitos Previos

### Software Requerido

| Software | Versión Mínima | Recomendada | Verificación |
|----------|----------------|-------------|--------------|
| **Node.js** | 18.0.0 | 20.x LTS | `node --version` |
| **npm** | 8.0.0 | 10.x | `npm --version` |
| **Docker** | 20.0.0 | 24.x | `docker --version` |
| **Docker Compose** | 2.0.0 | 2.x | `docker-compose --version` |
| **Git** | 2.30.0 | Latest | `git --version` |

### Verificación del Sistema

```bash
# Verificar todas las dependencias
node --version && npm --version && docker --version && docker-compose --version && git --version

# Verificar que Docker esté ejecutándose
docker ps

# Verificar puertos disponibles
netstat -tulpn | grep -E ':(3001|3002|5433|5672|8080|15672)'
```

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone <repository-url>
cd prueba_tecnica

# Verificar la estructura
ls -la
```

### 2. Levantar con Docker (Recomendado)

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver el progreso
docker-compose logs -f
```

### 3. Verificar Servicios

```bash
# Verificar que todos los contenedores estén ejecutándose
docker-compose ps

# Probar endpoints
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Order Service
```

### 4. Configurar Usuario Administrador

```bash
# Opción A: Crear admin via SQL (Recomendado)
docker-compose exec postgres psql -U postgres -d users_db

# En el prompt de PostgreSQL:
# 1. Primero crear un usuario normal via API
# 2. Luego actualizar su rol:
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';

# Opción B: Script interactivo (Recomendado)
cd user-service
npm run admin:create

# El script te pedirá:
# - Nombre del administrador
# - Email del administrador  
# - Contraseña
# Y creará el usuario con rol ADMIN automáticamente

# Opción C: Script rápido con datos predefinidos
cd user-service
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Administrador',
      email: 'admin@empresa.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Admin creado: admin@empresa.com / AdminPassword123!');
}

createAdmin().finally(() => prisma.disconnect());
"
```

## Configuración Detallada

### Configuración de Variables de Entorno

#### Opción 1: Usar Docker Compose (Recomendado)

Las variables están preconfiguradas en `docker-compose.yml`:

```yaml
# Variables ya configuradas
DATABASE_URL: "postgresql://postgres:12345678@postgres:5432/users_db?schema=public"
RABBITMQ_URL: "amqp://rabbit:12345678@rabbitmq:5672"
JWT_SECRET: "S3cr3t k3y*"
```

#### Opción 2: Archivos .env Locales

Para desarrollo local, crear archivos `.env`:

**user-service/.env**
```env
# Base de datos
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/users_db?schema=public"

# RabbitMQ
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"

# JWT
JWT_SECRET="S3cr3t k3y*"
JWT_EXPIRES_IN="1h"

# Servidor
PORT=3001
NODE_ENV=development

# Logs
LOG_LEVEL=debug
```

**order-service/.env**
```env
# Base de datos
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/orders_db?schema=public"

# RabbitMQ
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"

# JWT
JWT_SECRET="S3cr3t k3y*"

# Servidor
PORT=3002
NODE_ENV=development

# Logs
LOG_LEVEL=debug
```

### Configuración de Base de Datos

#### Inicialización Automática

El archivo `init-db.sql` crea automáticamente las bases de datos:

```sql
-- Se ejecuta automáticamente al iniciar PostgreSQL
CREATE DATABASE users_db;
CREATE DATABASE orders_db;
```

#### Configuración Manual (Opcional)

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres

# Crear bases de datos manualmente
CREATE DATABASE users_db;
CREATE DATABASE orders_db;

# Verificar
\l
```

### Configuración de Prisma

#### Generar Cliente Prisma

```bash
# En user-service
cd user-service
npx prisma generate
npx prisma db push

# En order-service
cd ../order-service
npx prisma generate
npx prisma db push
```

#### Verificar Esquemas

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver datos en Prisma Studio (opcional)
npx prisma studio
```

## Verificación de la Instalación

### 1. Verificar Contenedores

```bash
# Estado de todos los servicios
docker-compose ps

# Debería mostrar:
# postgres-db     Up (healthy)
# rabbitmq-broker Up (healthy)  
# pgadmin         Up
# user-service    Up
# order-service   Up
```

### 2. Verificar Conectividad

```bash
# Servicios principales
curl -f http://localhost:3001/health || echo "User Service: ERROR"
curl -f http://localhost:3002/health || echo "Order Service: ERROR"

# Interfaces web
curl -f http://localhost:8080 || echo "pgAdmin: ERROR"
curl -f http://localhost:15672 || echo "RabbitMQ: ERROR"
```

### 3. Verificar Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -c "\l"

# Verificar tablas en users_db
docker-compose exec postgres psql -U postgres -d users_db -c "\dt"

# Verificar tablas en orders_db
docker-compose exec postgres psql -U postgres -d orders_db -c "\dt"
```

### 4. Verificar RabbitMQ

```bash
# Estado de RabbitMQ
docker-compose exec rabbitmq rabbitmqctl status

# Listar colas
docker-compose exec rabbitmq rabbitmqctl list_queues
```

### 5. Prueba Funcional Completa

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Guardar el token de la respuesta anterior
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Crear pedido
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderItems": [
      {
        "productId": "test-product",
        "quantity": 1,
        "price": 99.99
      }
    ]
  }'
```

## Troubleshooting

### Problemas Comunes

#### 1. Puertos en Uso

```bash
# Error: Port already in use
# Verificar qué está usando el puerto
lsof -i :5433
lsof -i :3001

# Solución: Cambiar puertos en docker-compose.yml
ports:
  - "5434:5432"  # PostgreSQL
  - "3003:3001"  # User Service
```

#### 2. Contenedores No Inician

```bash
# Ver logs detallados
docker-compose logs user-service
docker-compose logs postgres

# Reiniciar servicios
docker-compose restart
docker-compose down && docker-compose up -d
```

#### 3. Problemas de Permisos

```bash
# En macOS/Linux, dar permisos a Docker
sudo chmod 666 /var/run/docker.sock

# Limpiar volúmenes si hay problemas de permisos
docker-compose down -v
docker volume prune
```

#### 4. Problemas de Red

```bash
# Verificar red de Docker
docker network ls
docker network inspect prueba_tecnica_microservices-network

# Recrear red
docker-compose down
docker network prune
docker-compose up -d
```

#### 5. Variables de Entorno

```bash
# Verificar variables en contenedor
docker-compose exec user-service env | grep -E "(DATABASE_URL|JWT_SECRET)"

# Verificar archivo .env
cat user-service/.env
```

### Comandos de Diagnóstico

```bash
# Estado completo del sistema
docker-compose ps
docker stats --no-stream
docker system df

# Logs de todos los servicios
docker-compose logs --tail=50

# Información detallada de un contenedor
docker inspect user-service

# Acceder al shell de un contenedor
docker-compose exec user-service sh
```

### Reinstalación Completa

```bash
# Parar y limpiar todo
docker-compose down -v
docker system prune -a
docker volume prune

# Reinstalar
docker-compose up -d --build
```

## Configuración para Desarrollo

### Setup Local (Sin Docker)

```bash
# 1. Instalar dependencias
cd user-service && npm install
cd ../order-service && npm install

# 2. Configurar bases de datos locales
# (Requiere PostgreSQL y RabbitMQ instalados localmente)

# 3. Ejecutar migraciones
cd user-service && npx prisma db push
cd ../order-service && npx prisma db push

# 4. Ejecutar servicios
cd user-service && npm run start:dev
cd ../order-service && npm run start:dev
```

### Configuración de IDE

#### VS Code Extensions Recomendadas

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-vscode-remote.remote-containers",
    "prisma.prisma"
  ]
}
```

#### Settings.json

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

[← Volver al README principal](../README.md) | [Siguiente: Docker →](./DOCKER.md) 
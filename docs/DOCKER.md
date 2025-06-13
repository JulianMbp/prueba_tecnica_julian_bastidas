# 🐳 Guía de Docker

## Tabla de Contenidos
- [Introducción](#introducción)
- [Arquitectura de Contenedores](#arquitectura-de-contenedores)
- [Docker Compose](#docker-compose)
- [Dockerfiles](#dockerfiles)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)
- [Optimización](#optimización)

## Introducción

El proyecto utiliza **Docker** y **Docker Compose** para crear un entorno de desarrollo y producción consistente. Todos los servicios están containerizados para facilitar el despliegue y la escalabilidad.

## Arquitectura de Contenedores

### Servicios Principales

```yaml
services:
  postgres:      # Base de datos PostgreSQL
  rabbitmq:      # Message broker
  pgadmin:       # Interfaz web para PostgreSQL
  user-service:  # Microservicio de usuarios
  order-service: # Microservicio de pedidos
```

### Red y Volúmenes

```yaml
networks:
  microservices-network:  # Red interna para comunicación

volumes:
  postgres_data:   # Persistencia de datos PostgreSQL
  rabbitmq_data:   # Persistencia de datos RabbitMQ
  pgadmin_data:    # Configuración de pgAdmin
```

## Docker Compose

### Configuración Principal

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 12345678
      POSTGRES_DB: ecommerce
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    networks:
      - microservices-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d ecommerce"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Variables de Entorno

Cada servicio tiene sus variables de entorno configuradas:

```yaml
user-service:
  environment:
    DATABASE_URL: "postgresql://postgres:12345678@postgres:5432/users_db?schema=public"
    RABBITMQ_URL: "amqp://rabbit:12345678@rabbitmq:5672"
    JWT_SECRET: "S3cr3t k3y*"
    PORT: 3001
    NODE_ENV: production
```

### Health Checks

Los servicios incluyen health checks para asegurar disponibilidad:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d ecommerce"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## Dockerfiles

### User Service Dockerfile

```dockerfile
# user-service/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar dependencias y build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### Optimizaciones del Dockerfile

1. **Multi-stage build**: Reduce el tamaño final de la imagen
2. **Usuario no-root**: Mejora la seguridad
3. **Cache de dependencias**: Optimiza rebuilds
4. **Alpine Linux**: Imagen base más pequeña

## Comandos Útiles

### Comandos Básicos

```bash
# Levantar todos los servicios
docker-compose up -d

# Levantar con rebuild
docker-compose up --build

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f user-service

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v
```

### Comandos de Desarrollo

```bash
# Reconstruir un servicio específico
docker-compose up --build user-service

# Ejecutar comando en contenedor
docker-compose exec user-service npm test

# Acceder al shell del contenedor
docker-compose exec user-service sh

# Ver estado de los servicios
docker-compose ps

# Ver uso de recursos
docker stats
```

### Comandos de Base de Datos

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d users_db

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres users_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres users_db < backup.sql

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Comandos de RabbitMQ

```bash
# Ver estado de RabbitMQ
docker-compose exec rabbitmq rabbitmqctl status

# Listar colas
docker-compose exec rabbitmq rabbitmqctl list_queues

# Ver conexiones
docker-compose exec rabbitmq rabbitmqctl list_connections

# Purgar cola
docker-compose exec rabbitmq rabbitmqctl purge_queue user_validation_queue
```

## Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso

```bash
# Error: Port 5433 is already in use
# Solución: Cambiar puerto en docker-compose.yml
ports:
  - "5434:5432"  # Usar puerto diferente
```

#### 2. Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs user-service

# Verificar health check
docker-compose ps

# Reiniciar servicio específico
docker-compose restart user-service
```

#### 3. Problemas de red

```bash
# Verificar red
docker network ls
docker network inspect prueba_tecnica_microservices-network

# Recrear red
docker-compose down
docker-compose up
```

#### 4. Problemas de volúmenes

```bash
# Listar volúmenes
docker volume ls

# Eliminar volúmenes huérfanos
docker volume prune

# Recrear volúmenes
docker-compose down -v
docker-compose up
```

### Debugging

#### Logs Detallados

```bash
# Logs con timestamps
docker-compose logs -f -t user-service

# Logs desde una fecha específica
docker-compose logs --since="2024-01-01T00:00:00" user-service

# Últimas 100 líneas
docker-compose logs --tail=100 user-service
```

#### Inspección de Contenedores

```bash
# Información del contenedor
docker inspect user-service

# Procesos en el contenedor
docker-compose exec user-service ps aux

# Uso de recursos
docker stats user-service
```

## Optimización

### Optimización de Imágenes

#### 1. Multi-stage Builds

```dockerfile
# Etapa de construcción
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Etapa de producción (más pequeña)
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
```

#### 2. .dockerignore

```dockerignore
# user-service/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.DS_Store
```

#### 3. Cache de Dependencias

```dockerfile
# Copiar solo package.json primero
COPY package*.json ./
RUN npm ci --only=production

# Luego copiar el resto del código
COPY . .
```

### Optimización de Performance

#### 1. Recursos Limitados

```yaml
# docker-compose.yml
user-service:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```

#### 2. Health Checks Optimizados

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Configuración de Producción

#### 1. Docker Compose Override

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  user-service:
    environment:
      NODE_ENV: production
      LOG_LEVEL: warn
    restart: unless-stopped
    
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - /var/lib/postgresql/data:/var/lib/postgresql/data
```

#### 2. Secrets Management

```yaml
# Usar Docker secrets en producción
services:
  user-service:
    secrets:
      - jwt_secret
      - db_password

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

### Monitoreo

#### 1. Logs Centralizados

```yaml
# Configurar logging driver
services:
  user-service:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 2. Métricas

```bash
# Exportar métricas de Docker
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Monitoreo continuo
watch -n 1 'docker stats --no-stream'
```

---

[← Volver al README principal](../README.md) | [Siguiente: Deployment →](./DEPLOYMENT.md) 
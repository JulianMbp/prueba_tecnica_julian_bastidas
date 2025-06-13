# 🛒 Sistema de Gestión de Pedidos E-commerce

Sistema de microservicios para gestión de usuarios y pedidos en e-commerce, desarrollado con **NestJS**, **PostgreSQL**, **Docker** y **RabbitMQ**.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución con Docker](#-ejecución-con-docker)
- [Endpoints API](#-endpoints-api)
- [Testing](#-testing)
- [Documentación API](#-documentación-api)
- [Base de Datos](#-base-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Documentación Detallada](#-documentación-detallada)
- [Contribución](#-contribución)

## ✨ Características

- **Arquitectura de Microservicios** con comunicación asíncrona
- **Autenticación JWT** con roles de usuario
- **Validación de datos** con class-validator
- **Base de datos PostgreSQL** con Prisma ORM
- **Mensajería asíncrona** con RabbitMQ
- **Documentación automática** con Swagger
- **Contenedores Docker** para desarrollo y producción
- **Testing unitario** con Jest
- **Linting y formateo** con ESLint y Prettier

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │  Order Service  │
│    (Port 3001)  │    │   (Port 3002)   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │    RabbitMQ     │
          │  (Port 5672)    │
          └─────────┬───────┘
                    │
          ┌─────────────────┐
          │   PostgreSQL    │
          │   (Port 5433)   │
          └─────────────────┘
```

## 🛠️ Tecnologías

### Backend
- **NestJS** v11 - Framework Node.js
- **TypeScript** - Lenguaje de programación
- **Prisma** v6.9 - ORM para base de datos
- **PostgreSQL** 15 - Base de datos relacional
- **RabbitMQ** - Message broker
- **JWT** - Autenticación y autorización
- **bcrypt** - Hashing de contraseñas

### DevOps & Tools
- **Docker** & **Docker Compose** - Contenedores
- **Swagger** - Documentación API
- **Jest** - Testing framework
- **ESLint** & **Prettier** - Linting y formateo

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **Docker** >= 20.0.0
- **Docker Compose** >= 2.0.0
- **Git**

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd prueba_tecnica
```

### 2. Configurar variables de entorno

Las variables de entorno están preconfiguradas en `docker-compose.yml`. Para desarrollo local, puedes crear archivos `.env`:

**user-service/.env**
```env
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/users_db?schema=public"
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"
JWT_SECRET="S3cr3t k3y*"
PORT=3001
```

**order-service/.env**
```env
DATABASE_URL="postgresql://postgres:12345678@localhost:5433/orders_db?schema=public"
RABBITMQ_URL="amqp://rabbit:12345678@localhost:5672"
JWT_SECRET="S3cr3t k3y*"
PORT=3002
```

## 🐳 Ejecución con Docker

### Levantar todo el entorno

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# En modo detached (segundo plano)
docker-compose up -d --build
```

### Comandos útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f user-service

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Reconstruir un servicio específico
docker-compose up --build user-service
```

### Verificar que los servicios estén funcionando

```bash
# User Service
curl http://localhost:3001/health

# Order Service  
curl http://localhost:3002/health
```

## 🌐 Endpoints API

### User Service (Puerto 3001)

#### Autenticación
- `POST /auth/register` - Registrar usuario con token
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener perfil (requiere JWT)

#### Usuarios
- `POST /users` - Registrar usuario básico

### Order Service (Puerto 3002)

#### Pedidos (Requieren autenticación JWT)
- `POST /orders` - Crear nuevo pedido
- `GET /orders` - Listar pedidos del usuario
- `PATCH /orders/:id` - Actualizar estado del pedido

### Ejemplos de uso

#### Registrar usuario
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

#### Iniciar sesión
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

#### Crear pedido
```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderItems": [
      {
        "productId": "product-123",
        "quantity": 2,
        "price": 29.99
      }
    ]
  }'
```

## 🧪 Testing

### Ejecutar tests en contenedores

```bash
# Tests del User Service
docker-compose exec user-service npm test

# Tests del Order Service
docker-compose exec order-service npm test

# Tests con coverage
docker-compose exec user-service npm run test:cov
docker-compose exec order-service npm run test:cov
```

### Ejecutar tests localmente

```bash
# Instalar dependencias
cd user-service && npm install
cd ../order-service && npm install

# Ejecutar tests
cd user-service && npm test
cd ../order-service && npm test
```

## 📚 Documentación API

La documentación Swagger está disponible en:

- **User Service**: http://localhost:3001/api/docs
- **Order Service**: http://localhost:3002/api/docs

### Características de la documentación:
- Especificaciones completas de endpoints
- Ejemplos de request/response
- Autenticación JWT integrada
- Modelos de datos documentados

## 🗄️ Base de Datos

### Acceso a PostgreSQL

**Credenciales:**
- Host: `localhost:5433`
- Usuario: `postgres`
- Contraseña: `12345678`
- Bases de datos: `users_db`, `orders_db`

### pgAdmin (Interfaz web)

- URL: http://localhost:8080
- Email: `admin@admin.com`
- Contraseña: `12345678`

### Esquemas de base de datos

#### User Service - users_db
```sql
-- Tabla users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Order Service - orders_db
```sql
-- Tabla orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status VARCHAR DEFAULT 'PENDING',
  total_amount DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📁 Estructura del Proyecto

```
prueba_tecnica/
├── user-service/
│   ├── src/
│   │   ├── auth/          # Módulo de autenticación
│   │   ├── users/         # Módulo de usuarios
│   │   ├── messaging/     # Comunicación RabbitMQ
│   │   └── prisma/        # Configuración Prisma
│   ├── prisma/
│   │   └── schema.prisma  # Esquema de base de datos
│   ├── Dockerfile
│   └── package.json
├── order-service/
│   ├── src/
│   │   ├── auth/          # Guards JWT
│   │   ├── orders/        # Módulo de pedidos
│   │   ├── messaging/     # Comunicación RabbitMQ
│   │   └── prisma/        # Configuración Prisma
│   ├── prisma/
│   │   └── schema.prisma  # Esquema de base de datos
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Configuración Docker
├── init-db.sql           # Inicialización BD
├── docs/                 # Documentación detallada
└── README.md
```

## 🔧 Variables de Entorno

### Servicios principales

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión PostgreSQL | Ver docker-compose.yml |
| `RABBITMQ_URL` | URL de conexión RabbitMQ | `amqp://rabbit:12345678@rabbitmq:5672` |
| `JWT_SECRET` | Clave secreta para JWT | `S3cr3t k3y*` |
| `PORT` | Puerto del servicio | 3001/3002 |
| `NODE_ENV` | Entorno de ejecución | `production` |

### Base de datos y servicios

| Servicio | Usuario | Contraseña | Puerto |
|----------|---------|------------|--------|
| PostgreSQL | `postgres` | `12345678` | 5433 |
| RabbitMQ | `rabbit` | `12345678` | 5672, 15672 |
| pgAdmin | `admin@admin.com` | `12345678` | 8080 |

## 📖 Documentación Detallada

Para mantener este README conciso, la documentación detallada está organizada en secciones separadas:

### 🔐 Autenticación y Seguridad
- **[Guía de Autenticación](./docs/AUTHENTICATION.md)** - JWT, roles, guards y estrategias
- **[Configuración de Seguridad](./docs/SECURITY.md)** - Mejores prácticas y configuraciones

### 🏗️ Arquitectura y Desarrollo
- **[Arquitectura de Microservicios](./docs/ARCHITECTURE.md)** - Patrones, comunicación y diseño
- **[Guía de Desarrollo](./docs/DEVELOPMENT.md)** - Setup local, debugging y workflows

### 🗄️ Base de Datos y Modelos
- **[Esquemas de Base de Datos](./docs/DATABASE.md)** - Modelos, relaciones y migraciones
- **[Guía de Prisma](./docs/PRISMA.md)** - ORM, queries y mejores prácticas

### 🐳 DevOps y Deployment
- **[Guía de Docker](./docs/DOCKER.md)** - Contenedores, compose y optimización
- **[Deployment](./docs/DEPLOYMENT.md)** - Producción, CI/CD y monitoreo

### 🧪 Testing y Calidad
- **[Guía de Testing](./docs/TESTING.md)** - Unit tests, integration tests y coverage
- **[Estándares de Código](./docs/CODE_STANDARDS.md)** - Linting, formateo y convenciones

### 📡 APIs y Comunicación
- **[Documentación de APIs](./docs/API.md)** - Endpoints, ejemplos y especificaciones
- **[RabbitMQ y Mensajería](./docs/MESSAGING.md)** - Colas, patrones y configuración

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de código

```bash
# Linting
npm run lint

# Formateo
npm run format

# Tests antes de commit
npm test
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🚀 Deployment

### Producción con Docker

```bash
# Construir imágenes para producción
docker-compose -f docker-compose.yml build

# Desplegar en producción
docker-compose -f docker-compose.yml up -d
```

### Consideraciones de seguridad

- Cambiar `JWT_SECRET` en producción
- Usar contraseñas seguras para base de datos
- Configurar CORS apropiadamente
- Implementar rate limiting
- Usar HTTPS en producción

---

## 👨‍💻 Sobre el Desarrollador

Este proyecto fue desarrollado con ❤️ por **[Julian_MBP](https://github.com/JulianMbp)** - Joven investigador UCC y UdeNar, Software Engineer y apasionado FullStack Developer.

### 🌟 Acerca de Julian
- 🔭 Actualmente trabajando como interno en **ParqueSoft Nariño**
- 🌱 Explorando el mundo de la **Inteligencia Artificial** y su potencial revolucionario
- 💞️ Interesado en colaborar en proyectos de IA y automatización de tareas
- 🎸 Fun fact: Disfruta tocando la guitarra y bailando en el gimnasio
- 📫 Contacto: **julian.bastidasmp@gmail.com**

### 🛠️ Stack Tecnológico
Julian tiene experiencia en múltiples tecnologías incluyendo React, Angular, NestJS, Flutter, Python, Docker, PostgreSQL, MongoDB, y muchas más. Puedes ver todos sus proyectos en su [perfil de GitHub](https://github.com/JulianMbp).

**¿Te gusta este proyecto? ¡Dale una ⭐ en GitHub y sígueme para más proyectos increíbles!**

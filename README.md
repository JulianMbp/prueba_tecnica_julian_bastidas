# 🛒 Sistema de Gestión de Pedidos E-commerce

Sistema de microservicios para gestión de usuarios y pedidos en e-commerce, desarrollado con **NestJS**, **PostgreSQL**, **Docker** y **RabbitMQ**.

## 📋 Tabla de Contenidos

### 📖 **Este Documento**
- [🚀 Inicio Rápido](#-inicio-rápido)
- [🏗️ Arquitectura](#️-arquitectura)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [👨🏻‍💻 Documentaicon Completa](#-documentación-completa)
- [🌐 Servicios y Accesos](#-servicios-y-accesos)
- [🤝 Contribución](#-contribución)
- [👨‍💻 Sobre el Desarrollador](#-sobre-el-desarrollador)


## 🚀 Inicio Rápido

```bash
# Clonar el repositorio
git clone <repository-url>
cd prueba_tecnica

# Levantar todos los servicios
docker-compose up -d --build

# Verificar que los servicios estén funcionando
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Order Service
```

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

## 🛠️ Stack Tecnológico

- **Backend**: NestJS v11, TypeScript, Prisma ORM
- **Base de Datos**: PostgreSQL 15
- **Mensajería**: RabbitMQ
- **Contenedores**: Docker & Docker Compose
- **Autenticación**: JWT con Passport.js
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest

## 📚 Documentación Completa

### 🚀 **Primeros Pasos**
- **[Instalación y Configuración](./docs/INSTALLATION.md)** - Setup completo del proyecto
- **[Ejecución con Docker](./docs/DOCKER.md)** - Guía completa de contenedores
- **[Variables de Entorno](./docs/ENVIRONMENT.md)** - Configuración de variables

### 🏗️ **Arquitectura y Desarrollo**
- **[Arquitectura de Microservicios](./docs/ARCHITECTURE.md)** - Patrones y diseño del sistema
- **[Guía de Desarrollo](./docs/DEVELOPMENT.md)** - Workflows y mejores prácticas
- **[Estructura del Proyecto](./docs/PROJECT_STRUCTURE.md)** - Organización del código

### 🔐 **Autenticación y Seguridad**
- **[Guía de Autenticación](./docs/AUTHENTICATION.md)** - JWT, guards y estrategias
- **[Configuración de Seguridad](./docs/SECURITY.md)** - Mejores prácticas de seguridad

### 🗄️ **Base de Datos**
- **[Esquemas y Modelos](./docs/DATABASE.md)** - Estructura de base de datos
- **[Guía de Prisma](./docs/PRISMA.md)** - ORM, migraciones y queries

### 📡 **APIs y Comunicación**
- **[Documentación de APIs](./docs/API.md)** - Endpoints y ejemplos completos
- **[RabbitMQ y Mensajería](./docs/MESSAGING.md)** - Colas y comunicación asíncrona

### 🧪 **Testing y Calidad**
- **[Guía de Testing](./docs/TESTING.md)** - Unit tests, integration tests
- **[Estándares de Código](./docs/CODE_STANDARDS.md)** - Linting y convenciones

### 🚀 **Deployment y Producción**
- **[Guía de Deployment](./docs/DEPLOYMENT.md)** - Producción y CI/CD
- **[Monitoreo y Logs](./docs/MONITORING.md)** - Observabilidad del sistema

## 🌐 Servicios y Accesos

| Servicio | URL | Documentación |
|----------|-----|---------------|
| **User Service** | http://localhost:3001 | http://localhost:3001/api/docs |
| **Order Service** | http://localhost:3002 | http://localhost:3002/api/docs |
| **PostgreSQL** | localhost:5433 | - |
| **pgAdmin** | http://localhost:8080 | admin@admin.com / 12345678 |
| **RabbitMQ** | http://localhost:15672 | rabbit / 12345678 |

## 🤝 Contribución

¿Quieres contribuir al proyecto? ¡Genial! Lee nuestra **[Guía de Contribución](./docs/CONTRIBUTING.md)** para comenzar.

```bash
# Fork el proyecto
git fork <repository-url>

# Crea una rama para tu feature
git checkout -b feature/amazing-feature

# Haz tus cambios y tests
npm test

# Commit y push
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature

# Abre un Pull Request
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver **[LICENSE](./LICENSE)** para más detalles.

---

## 👨‍💻 Sobre el Desarrollador

<div align="center">

### **[Julian_MBP](https://github.com/JulianMbp)**
*Joven investigador UCC y UdeNar | Software Engineer | FullStack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-JulianMbp-181717?style=for-the-badge&logo=github)](https://github.com/JulianMbp)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-julian--bastidas-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/julian-bastidas-27779b18b)
[![Website](https://img.shields.io/badge/Website-julian--mbp.pro-FF6B6B?style=for-the-badge&logo=safari)](https://www.julian-mbp.pro/)

</div>

### 🌟 Acerca de Julian
- 🔭 Actualmente trabajando como interno en **ParqueSoft Nariño**
- 🌱 Explorando el mundo de la **Inteligencia Artificial** y automatización
- 💞️ Interesado en colaborar en proyectos de IA y desarrollo móvil
- 🎸 Fun fact: Disfruta tocando la guitarra y bailando en el gimnasio
- 📫 Contacto: **julian.bastidasmp@gmail.com**

### 🛠️ Stack Tecnológico
Julian tiene experiencia en múltiples tecnologías: React, Angular, NestJS, Flutter, Python, Docker, PostgreSQL, MongoDB, y muchas más. 

**¿Te gusta este proyecto? ¡Dale una ⭐ en GitHub y sígueme para más proyectos increíbles!**

---

<div align="center">

**Desarrollado con ❤️ por [Julian_MBP](https://github.com/JulianMbp) usando NestJS y TypeScript**

</div>

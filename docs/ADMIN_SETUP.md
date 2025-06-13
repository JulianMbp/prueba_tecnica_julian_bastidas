# 👑 Guía de Configuración de Administradores

## 📋 Índice
- [Información General](#información-general)
- [Métodos de Creación](#métodos-de-creación)
- [Script Interactivo (Recomendado)](#script-interactivo-recomendado)
- [Método SQL Directo](#método-sql-directo)
- [Verificación y Troubleshooting](#verificación-y-troubleshooting)
- [Gestión de Administradores](#gestión-de-administradores)

## Información General

### 🔍 Roles en el Sistema

El sistema maneja dos roles principales:
- **USER**: Usuario estándar (por defecto)
- **ADMIN**: Administrador con permisos especiales

### 🎯 Características de Administradores

Los usuarios administradores pueden:
- ✅ Ver todas las órdenes del sistema (`GET /orders/admin/all`)
- ✅ Actualizar estados de órdenes de cualquier usuario
- ✅ Acceder a endpoints administrativos
- ✅ Gestionar otros usuarios (futuras funcionalidades)

## Métodos de Creación

### 🥇 Script Interactivo (Recomendado)

```bash
# Navegar al user-service
cd user-service

# Ejecutar script interactivo
npm run admin:create
```

**¿Por qué es recomendado?**
- ✅ Interfaz intuitiva con preguntas guiadas
- ✅ Validaciones automáticas de datos
- ✅ Manejo de errores robusto
- ✅ Verificación de conexión a BD
- ✅ Actualiza usuarios existentes automáticamente

**Ejemplo de ejecución:**
```
🚀 Script de Creación de Administrador - User Service

✅ Conexión a base de datos establecida

🛡️ Configuración de Usuario Administrador

Nombre del administrador: María Admin
Email del administrador: maria@empresa.com
Contraseña (mínimo 6 caracteres): AdminPass123

⏳ Creando administrador...

✅ Usuario administrador creado exitosamente
👤 ID: 123e4567-e89b-12d3-a456-426614174000
📧 Email: maria@empresa.com
🏷️ Rol: ADMIN

🔐 Credenciales de acceso:
📧 Email: maria@empresa.com
🔑 Contraseña: AdminPass123

📋 Pasos siguientes:
1. Guarda estas credenciales de forma segura
2. Prueba el login en: http://localhost:3001/api/docs
3. Usa el token JWT para acceder a endpoints de administrador
```

### 🗃️ Método SQL Directo

**Opción A: Actualizar usuario existente**
```sql
-- Conectar a la base de datos
docker-compose exec postgres psql -U postgres -d users_db

-- Actualizar rol de usuario existente
UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@ejemplo.com';

-- Verificar el cambio
SELECT id, email, name, role FROM users WHERE role = 'ADMIN';
```

**Opción B: Crear desde cero via SQL**
```sql
-- Insertar nuevo administrador (contraseña hasheada)
INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(),
  'Admin Sistema',
  'admin@sistema.com',
  '$2b$10$ejemplo.hash.aqui', -- Usar bcrypt para generar
  'ADMIN',
  NOW(),
  NOW()
);
```

### ⚡ Script Rápido

```bash
cd user-service

# Script con datos predefinidos
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Administrador del Sistema',
      email: 'admin@empresa.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Admin creado/actualizado:');
  console.log('📧 Email: admin@empresa.com');
  console.log('🔑 Password: AdminPassword123!');
  console.log('🆔 ID:', admin.id);
}

createAdmin().finally(() => prisma.\$disconnect());
"
```

## Verificación y Troubleshooting

### ✅ Verificar Administrador

```bash
# Verificar en base de datos
docker-compose exec postgres psql -U postgres -d users_db \
  -c "SELECT id, email, name, role FROM users WHERE role = 'ADMIN';"

# Probar login vía API
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "AdminPassword123!"
  }'
```

### 🛠️ Problemas Comunes

#### Error: "Cannot connect to database"
```bash
# Solución: Verificar que PostgreSQL esté ejecutándose
docker-compose ps postgres
docker-compose up -d postgres

# Verificar logs
docker-compose logs postgres
```

#### Error: "User already exists"
```bash
# El script automáticamente actualiza el rol, pero si usas SQL:
UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@ejemplo.com';
```

#### Error: "ts-node not found"
```bash
# Instalar ts-node globalmente
npm install -g ts-node

# O usar npx
npx ts-node scripts/create-admin.ts
```

### 🔐 Probar Funcionalidad de Admin

```bash
# 1. Hacer login como admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"AdminPassword123!"}' \
  | jq -r '.access_token')

# 2. Probar endpoint de admin (ver todas las órdenes)
curl -X GET http://localhost:3002/orders/admin/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Verificar perfil
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Gestión de Administradores

### 🔄 Cambiar Usuario de ADMIN a USER

```sql
-- Conectar a base de datos
docker-compose exec postgres psql -U postgres -d users_db

-- Cambiar rol
UPDATE users SET role = 'USER' WHERE email = 'admin@empresa.com';
```

### 🗑️ Eliminar Administrador

```sql
-- ⚠️ CUIDADO: Esto eliminará el usuario completamente
DELETE FROM users WHERE email = 'admin@empresa.com' AND role = 'ADMIN';
```

### 📋 Listar Todos los Administradores

```sql
-- Ver todos los administradores
SELECT 
  id,
  name,
  email,
  role,
  "createdAt",
  "updatedAt"
FROM users 
WHERE role = 'ADMIN'
ORDER BY "createdAt" DESC;
```

### 🔒 Mejores Prácticas de Seguridad

1. **Contraseñas Fuertes**
   - Mínimo 8 caracteres
   - Incluir mayúsculas, minúsculas, números y símbolos
   - No usar contraseñas predecibles

2. **Acceso Limitado**
   - Crear solo los administradores necesarios
   - Revisar regularmente quién tiene acceso de admin

3. **Auditoría**
   - Monitorear acciones de administradores
   - Mantener logs de cambios importantes

4. **Rotación de Credenciales**
   - Cambiar contraseñas regularmente
   - Revocar acceso cuando no sea necesario

## 📚 Referencias

- [Documentación de Autenticación](./AUTHENTICATION.md)
- [Guía de Instalación](./INSTALLATION.md)
- [API Documentation](./API.md)
- [Changelog](./CHANGELOG.md)

---

**⚠️ Nota Importante**: 
En producción, considera implementar autenticación de dos factores (2FA) y políticas de contraseñas más estrictas para administradores.

**💡 Tip**: 
Guarda las credenciales del primer administrador en un gestor de contraseñas seguro como 1Password, Bitwarden, o similar. 
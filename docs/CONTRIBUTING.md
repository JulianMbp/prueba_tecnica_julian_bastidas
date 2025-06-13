# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos
- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Issues](#reportar-issues)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

### Nuestros Compromisos

- Usar un lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas de manera elegante
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

Valoramos todos los tipos de contribuciones:

- 🐛 **Reportar bugs**
- 💡 **Sugerir nuevas características**
- 📝 **Mejorar documentación**
- 🔧 **Corregir bugs**
- ✨ **Implementar nuevas características**
- 🧪 **Escribir tests**
- 🎨 **Mejorar UI/UX**

### Proceso General

1. **Fork** el repositorio
2. **Crea** una rama para tu contribución
3. **Haz** tus cambios
4. **Escribe** tests si es necesario
5. **Ejecuta** los tests existentes
6. **Commit** tus cambios
7. **Push** a tu fork
8. **Abre** un Pull Request

## ⚙️ Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/prueba_tecnica.git
cd prueba_tecnica

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/JulianMbp/prueba_tecnica.git
```

### 2. Configuración Local

```bash
# Instalar dependencias
cd user-service && npm install
cd ../order-service && npm install

# O usar Docker
docker-compose up -d --build
```

### 3. Verificar Configuración

```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Verificar formato
npm run format
```

## 📏 Estándares de Código

### Convenciones de Naming

#### Variables y Funciones
```typescript
// ✅ Correcto - camelCase
const userName = 'julian';
const getUserById = (id: string) => { ... };

// ❌ Incorrecto
const user_name = 'julian';
const GetUserById = (id: string) => { ... };
```

#### Clases y Interfaces
```typescript
// ✅ Correcto - PascalCase
class UserService { ... }
interface UserResponse { ... }

// ❌ Incorrecto
class userService { ... }
interface userResponse { ... };
```

#### Constantes
```typescript
// ✅ Correcto - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ Incorrecto
const maxRetryAttempts = 3;
const apiBaseUrl = 'https://api.example.com';
```

### Estructura de Archivos

```typescript
// ✅ Estructura recomendada para un módulo
src/
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── users.service.spec.ts
```

### Comentarios y Documentación

```typescript
/**
 * Crea un nuevo usuario en el sistema
 * @param createUserDto - Datos del usuario a crear
 * @returns Promise<UserResponseDto> - Usuario creado sin contraseña
 * @throws ConflictException - Si el email ya existe
 */
async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
  // Verificar si el usuario ya existe
  const existingUser = await this.findByEmail(createUserDto.email);
  
  if (existingUser) {
    throw new ConflictException('El usuario ya existe');
  }
  
  // Crear el usuario...
}
```

### ESLint y Prettier

El proyecto usa ESLint y Prettier para mantener consistencia:

```bash
# Verificar linting
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

### Configuración de Git Hooks

```bash
# Instalar husky para git hooks
npm install --save-dev husky

# Configurar pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## 🔄 Proceso de Pull Request

### 1. Crear Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear nueva rama
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer Cambios

```bash
# Hacer tus cambios
# Escribir tests si es necesario
# Ejecutar tests
npm test

# Verificar linting
npm run lint
```

### 3. Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos de commit
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan funcionalidad)
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento

# Ejemplos
git commit -m "feat: add user authentication endpoint"
git commit -m "fix: resolve JWT token validation issue"
git commit -m "docs: update API documentation"
```

### 4. Push y PR

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Crear Pull Request en GitHub
# Usar la plantilla de PR
```

### Plantilla de Pull Request

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva característica (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## ¿Cómo se ha probado?
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas manuales

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas difíciles de entender
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Los tests nuevos y existentes pasan localmente
```

## 🐛 Reportar Issues

### Antes de Reportar

1. **Busca** issues existentes
2. **Verifica** que sea reproducible
3. **Actualiza** a la última versión

### Plantilla de Bug Report

```markdown
## Descripción del Bug
Descripción clara y concisa del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado
Descripción clara de lo que esperabas que pasara.

## Comportamiento Actual
Descripción clara de lo que realmente pasa.

## Screenshots
Si aplica, agrega screenshots para explicar el problema.

## Entorno
- OS: [e.g. macOS, Windows, Linux]
- Node.js: [e.g. 18.17.0]
- Docker: [e.g. 24.0.0]
- Navegador: [e.g. Chrome 91.0]

## Información Adicional
Cualquier otra información relevante sobre el problema.
```

### Plantilla de Feature Request

```markdown
## ¿Tu feature request está relacionado con un problema?
Descripción clara del problema. Ej: "Estoy frustrado cuando..."

## Describe la solución que te gustaría
Descripción clara y concisa de lo que quieres que pase.

## Describe alternativas que has considerado
Descripción clara de cualquier solución alternativa.

## Información Adicional
Cualquier otra información o screenshots sobre el feature request.
```

## 🧪 Testing

### Escribir Tests

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBeUndefined();
    });
  });
});
```

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests e2e
npm run test:e2e
```

## 📚 Documentación

### Actualizar Documentación

Si tu cambio afecta la API o funcionalidad:

1. **Actualiza** los comentarios JSDoc
2. **Modifica** la documentación en `/docs`
3. **Actualiza** el README si es necesario
4. **Verifica** que Swagger esté actualizado

### Swagger/OpenAPI

```typescript
// Documentar endpoints con decoradores
@ApiOperation({ summary: 'Crear nuevo usuario' })
@ApiResponse({ 
  status: 201, 
  description: 'Usuario creado exitosamente',
  type: UserResponseDto 
})
@ApiResponse({ 
  status: 409, 
  description: 'El usuario ya existe' 
})
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}
```

## 🎉 Reconocimiento

Los contribuidores serán reconocidos en:

- Lista de contribuidores en el README
- Release notes
- Agradecimientos especiales para contribuciones significativas

## 📞 Contacto

¿Tienes preguntas? Puedes contactarnos:

- **Email**: julian.bastidasmp@gmail.com
- **GitHub Issues**: Para preguntas técnicas
- **GitHub Discussions**: Para discusiones generales

---

¡Gracias por contribuir! 🚀

[← Volver al README principal](../README.md) 
# 🔐 Guía de Autenticación y Seguridad

## Tabla de Contenidos
- [Introducción](#introducción)
- [Arquitectura JWT](#arquitectura-jwt)
- [Configuración de Autenticación](#configuración-de-autenticación)
- [Guards y Estrategias](#guards-y-estrategias)
- [Roles y Permisos](#roles-y-permisos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Mejores Prácticas](#mejores-prácticas)

## Introducción

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación y autorización de usuarios. La implementación está basada en **Passport.js** con estrategias personalizadas para NestJS.

## Arquitectura JWT

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant US as User Service
    participant DB as Base de Datos
    participant OS as Order Service

    C->>US: POST /auth/login (email, password)
    US->>DB: Verificar credenciales
    DB-->>US: Usuario válido
    US->>US: Generar JWT
    US-->>C: Token JWT + datos usuario
    
    C->>OS: GET /orders (Authorization: Bearer token)
    OS->>OS: Validar JWT
    OS->>US: Verificar usuario (RabbitMQ)
    US-->>OS: Usuario válido
    OS-->>C: Lista de pedidos
```

### Estructura del Token

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid-123",
    "email": "user@example.com",
    "role": "USER",
    "iat": 1640995200,
    "exp": 1640998800
  }
}
```

## Configuración de Autenticación

### JWT Module Configuration

```typescript
// user-service/src/auth/auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: '1h',
          issuer: 'user-service',
          audience: 'ecommerce-app'
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
```

### Variables de Entorno

```env
JWT_SECRET="tu-clave-super-secreta-aqui"
JWT_EXPIRES_IN="1h"
JWT_ISSUER="user-service"
JWT_AUDIENCE="ecommerce-app"
```

## Guards y Estrategias

### JWT Strategy

```typescript
// user-service/src/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: 'user-service',
      audience: 'ecommerce-app',
    });
  }

  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
```

### JWT Auth Guard

```typescript
// Aplicado globalmente en main.ts
app.useGlobalGuards(new JwtAuthGuard());

// Para rutas públicas, usar el decorador @Public()
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### Decorador Public

```typescript
// user-service/src/auth/decorators/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## Roles y Permisos

### Enum de Roles

```typescript
// user-service/prisma/schema.prisma
enum Role {
  USER
  ADMIN
}
```

### Role Guard (Ejemplo)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

## Ejemplos de Uso

### Registro de Usuario

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "MiPassword123!"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid-123",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "role": "USER"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiPassword123!"
  }'
```

### Acceso a Rutas Protegidas

```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Mejores Prácticas

### Seguridad del Token

1. **Tiempo de Expiración Corto**: Usar tokens de corta duración (1 hora)
2. **Refresh Tokens**: Implementar refresh tokens para renovación automática
3. **Blacklist**: Mantener lista de tokens revocados
4. **HTTPS Only**: Transmitir tokens solo por HTTPS en producción

### Validación de Contraseñas

```typescript
// Requisitos mínimos de contraseña
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Hashing con bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Rate Limiting

```typescript
// Implementar rate limiting para endpoints de auth
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 intentos por minuto
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### Configuración CORS

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## Troubleshooting

### Errores Comunes

1. **"secretOrPrivateKey must have a value"**
   - Verificar que JWT_SECRET esté configurado
   - Validar que ConfigService esté importado correctamente

2. **"Unauthorized"**
   - Verificar formato del token: `Bearer <token>`
   - Validar que el token no haya expirado
   - Confirmar que el usuario existe en la base de datos

3. **CORS Errors**
   - Configurar CORS apropiadamente
   - Verificar que el frontend envíe headers correctos

### Debugging

```typescript
// Habilitar logs detallados
const logger = new Logger('AuthService');

async validate(payload: JwtPayload) {
  logger.debug(`Validating token for user: ${payload.sub}`);
  // ... resto del código
}
```

---

[← Volver al README principal](../README.md) | [Siguiente: Configuración de Seguridad →](./SECURITY.md) 
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      validateUser: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    usersService = module.get<jest.Mocked<UsersService>>(UsersService);

    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const accessToken = 'jwt-token-123';
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(accessToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        user: mockUser,
      });
    });

    it('should handle user creation errors', async () => {
      // Arrange
      usersService.create.mockRejectedValue(new Error('User creation failed'));

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'User creation failed',
      );
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const accessToken = 'jwt-token-123';
      usersService.validateUser.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(accessToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result.access_token).toBe(accessToken);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      // Arrange
      usersService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
      expect(usersService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      // Act
      const result = service.getProfile(mockUser);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });
});

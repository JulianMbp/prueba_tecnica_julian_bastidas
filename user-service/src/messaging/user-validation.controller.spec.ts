import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { UserValidationController } from './user-validation.controller';

describe('UserValidationController', () => {
  let controller: UserValidationController;
  let usersService: jest.Mocked<UsersService>;

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
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserValidationController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UserValidationController>(UserValidationController);

    usersService = module.get<jest.Mocked<UsersService>>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return valid response when user exists', async () => {
      // Arrange
      const request = { userId: 'user-uuid-123' };
      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await controller.validateUser(request);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(request.userId);
      expect(result).toEqual({
        isValid: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should return invalid response when user does not exist', async () => {
      // Arrange
      const request = { userId: 'nonexistent-user-id' };
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await controller.validateUser(request);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(request.userId);
      expect(result).toEqual({
        isValid: false,
        error: 'Usuario no encontrado',
      });
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const request = { userId: 'user-uuid-123' };
      (usersService.findById as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      // Act
      const result = await controller.validateUser(request);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(request.userId);
      expect(result).toEqual({
        isValid: false,
        error: 'Error interno del servidor',
      });
    });
  });
});

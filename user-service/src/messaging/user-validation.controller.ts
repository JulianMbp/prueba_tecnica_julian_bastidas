import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';

export interface UserValidationRequest {
  userId: string;
}

export interface UserValidationResponse {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

@Controller()
export class UserValidationController {
  private readonly logger = new Logger(UserValidationController.name);

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('validate_user')
  async validateUser(
    @Payload() data: UserValidationRequest,
  ): Promise<UserValidationResponse> {
    this.logger.log(
      `Received user validation request: ${JSON.stringify(data)}`,
    );

    try {
      const user = await this.usersService.findById(data.userId);

      if (!user) {
        this.logger.warn(`User not found: ${data.userId}`);
        return {
          isValid: false,
          error: 'Usuario no encontrado',
        };
      }

      this.logger.log(`User validation successful: ${user.id}`);
      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Error validating user ${data.userId}:`, error);
      return {
        isValid: false,
        error: 'Error interno del servidor',
      };
    }
  }
}

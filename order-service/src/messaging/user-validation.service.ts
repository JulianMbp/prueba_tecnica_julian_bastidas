import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

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

@Injectable()
export class UserValidationService {
  private readonly logger = new Logger(UserValidationService.name);
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          this.configService.get<string>('RABBITMQ_URL') ||
            'amqp://localhost:5672',
        ],
        queue: 'user_validation_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async validateUser(userId: string): Promise<UserValidationResponse> {
    try {
      this.logger.log(`Validating user: ${userId}`);

      const response = await firstValueFrom(
        this.client
          .send<
            UserValidationResponse,
            UserValidationRequest
          >('validate_user', { userId })
          .pipe(timeout(5000)),
      );

      this.logger.log(`User validation response: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`Error validating user ${userId}:`, error);
      return {
        isValid: false,
        error: 'Error al validar usuario',
      };
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}

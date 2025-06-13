import { RegisterDto } from '../../auth/dto/register.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export interface IUserRepository {
  create(registerDto: RegisterDto): Promise<UserResponseDto>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<UserResponseDto | null>;
}

export interface UserWithPassword {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

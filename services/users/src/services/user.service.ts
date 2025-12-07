import { userRepository } from '../repositories/user.repository';
import { CreateUserDto, LoginDto } from '../types/user.types';
import { comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { hashPassword } from '../utils/password.util';

export class UserService {
  async createUser(createUserDto: CreateUserDto) {
    // Business logic: Check if user already exists
    const existingUser = await userRepository.existsByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Business logic: Hash password
    const hashedPassword = await hashPassword(createUserDto.password);

    // Repository: Create user in database
    const user = await userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Business logic: Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    // Repository: Find user by email
    const user = await userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Business logic: Validate password
    const isPasswordValid = await comparePassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Business logic: Generate JWT token
    const token = generateToken(user.id);

    // Business logic: Remove password from response
    const { password, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  async getUserById(userId: string) {
    // Repository: Find user by ID
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Business logic: Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateUser(userId: string) {
    // Repository: Find user by ID
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Business logic: Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const userService = new UserService();

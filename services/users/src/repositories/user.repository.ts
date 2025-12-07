import { UserModel as UserSequelizeModel } from '../models/user.sequelize';
import { CreateUserDto } from '../types/user.types';

export class UserRepository {
  async create(createUserDto: CreateUserDto & { password: string }) {
    const user = await UserSequelizeModel.create({
      email: createUserDto.email,
      password: createUserDto.password,
      name: createUserDto.name,
    });
    return user.toJSON();
  }

  async findByEmail(email: string) {
    const user = await UserSequelizeModel.findOne({ where: { email } });
    return user ? user.toJSON() : null;
  }

  async findById(id: string) {
    const user = await UserSequelizeModel.findByPk(id);
    return user ? user.toJSON() : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserSequelizeModel.count({ where: { email } });
    return count > 0;
  }
}

export const userRepository = new UserRepository();




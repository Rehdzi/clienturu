import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './users.model';

const USER_PUBLIC_ATTRIBUTES = { exclude: ['password'] };

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);
    const role = await this.roleService.getRoleByValue('User');

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await user.$set('roles', [role.id]);
    user.roles = [role];
    return user;
  }

  async getAllUsers() {
    return this.userRepository.findAll({
      attributes: USER_PUBLIC_ATTRIBUTES,
      include: { all: true },
    });
  }

  async getUserByPhone(phone: string) {
    return this.userRepository.findOne({
      where: { phone },
      include: { all: true },
    });
  }

  async getUserById(id: number) {
    return this.userRepository.findByPk(id, {
      include: { all: true },
    });
  }
}

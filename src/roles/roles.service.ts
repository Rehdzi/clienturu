import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRoleDto } from 'src/users/users/dto/create-role.dto';
import { Role } from './roles.model';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(dto: CreateRoleDto) {
    const role = await this.roleRepository.create(dto);
    return role;
  }

  async getRoleByValue(value: string) {
    const role = await this.roleRepository.findOne({ where: { value } });
    return role;
  }

  // Ensures a role with the given value exists, creating it if missing.
  // Reuses the roles table so staff/master roles share the same mechanism.
  async getOrCreateRole(value: string, description: string) {
    const [role] = await this.roleRepository.findOrCreate({
      where: { value },
      defaults: { value, description },
    });
    return role;
  }
}

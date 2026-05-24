import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles-model';
import { Organization } from 'src/organization/organization.model';
import { Service } from 'src/services/service.model';
import { OrganizationStaff } from 'src/staff/organization-staff.model';
import { StaffService } from 'src/staff/staff-service.model';

interface UserCreationAttrs {
  phone: string;
  name: string;
  password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: 1, description: 'User ID' })
  declare id: number;

  @ApiProperty({ example: '9001234567', description: 'Phone number' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare phone: string;

  @ApiProperty({ example: 'John Doe', description: 'Display name' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @BelongsToMany(() => Role, () => UserRoles)
  declare roles: Role[];

  @HasMany(() => Organization)
  declare organizations: Organization[];

  // Organizations where this user is assigned as a master/staff member.
  @BelongsToMany(() => Organization, () => OrganizationStaff)
  declare staffOrganizations: Organization[];

  // Services this user (as a master) is able to provide.
  @BelongsToMany(() => Service, () => StaffService)
  declare providedServices: Service[];

  toJSON() {
    const { password: _password, ...attributes } = this.get();
    return attributes;
  }
}

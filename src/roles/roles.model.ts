import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { UserRoles } from './user-roles-model';

interface RoleCreationAttrs {
  value: string;
  description: string;
}

@Table({ tableName: 'roles' })
export class Role extends Model<Role, RoleCreationAttrs> {
  @ApiProperty({ example: 'User', description: 'User role name' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare value: string;

  @ApiProperty({
    example: 'Using this service',
    description: 'User role description',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @BelongsToMany(() => User, () => UserRoles)
  declare users: User[];
}

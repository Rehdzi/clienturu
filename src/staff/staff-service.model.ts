import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { Service } from 'src/services/service.model';

// Join table linking a master (User) to the services they can perform.
// Follows the UserRoles convention: no createdAt/updatedAt timestamps.
@Table({ tableName: 'staff_services', createdAt: false, updatedAt: false })
export class StaffService extends Model<StaffService> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Service)
  @Column({ type: DataType.INTEGER })
  declare serviceId: number;
}

import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { Organization } from 'src/organization/organization.model';

interface OrganizationStaffCreationAttrs {
  organizationId: number;
  userId: number;
}

// Join table linking an Organization to its staff (masters).
// Follows the UserRoles convention: no createdAt/updatedAt timestamps.
@Table({ tableName: 'organization_staff', createdAt: false, updatedAt: false })
export class OrganizationStaff extends Model<
  OrganizationStaff,
  OrganizationStaffCreationAttrs
> {
  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER })
  declare organizationId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare userId: number;
}

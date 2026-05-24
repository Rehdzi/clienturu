import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Organization } from 'src/organization/organization.model';
import { User } from 'src/users/users/users.model';
import { StaffService } from 'src/staff/staff-service.model';

interface ServiceCreationAttrs {
  organizationId: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

@Table({ tableName: 'services' })
export class Service extends Model<Service, ServiceCreationAttrs> {
  @ApiProperty({ example: 1, description: 'Service ID' })
  declare id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the organization offering this service',
  })
  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare organizationId: number;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @ApiProperty({ example: 'Haircut', description: 'Service name' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty({
    example: 'Classic men haircut',
    description: 'Service description',
    required: false,
  })
  @Column({ type: DataType.STRING, allowNull: true })
  declare description: string;

  @ApiProperty({ example: 25.5, description: 'Service price' })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  declare price: number;

  // Positive integer count of minutes. Used later to generate bookable time slots.
  @ApiProperty({
    example: 30,
    description: 'Service duration in minutes (positive integer)',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare durationMinutes: number;

  @ApiProperty({
    example: true,
    description: 'Whether the service is currently offered',
  })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  // Masters (staff users) who can perform this service, via the join table.
  @BelongsToMany(() => User, () => StaffService)
  declare providers: User[];
}

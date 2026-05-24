import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { Organization } from 'src/organization/organization.model';

interface ScheduleCreationAttrs {
  userId: number;
  organizationId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// A master's weekly working hours. One row per (master, dayOfWeek).
// Times are stored as plain "HH:mm" strings rather than Date values to avoid
// timezone conversion issues; the slot generator combines these with a date.
@Table({ tableName: 'schedules' })
export class Schedule extends Model<Schedule, ScheduleCreationAttrs> {
  @ApiProperty({ example: 1, description: 'Schedule ID' })
  declare id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the master (User) this schedule belongs to',
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @ApiProperty({
    example: 1,
    description: 'ID of the organization the master works at',
  })
  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare organizationId: number;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @ApiProperty({
    example: 1,
    description: 'Day of week, 0 (Sunday) to 6 (Saturday)',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare dayOfWeek: number;

  @ApiProperty({
    example: '09:00',
    description: 'Start of working hours, "HH:mm"',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  declare startTime: string;

  @ApiProperty({
    example: '18:00',
    description: 'End of working hours, "HH:mm"',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  declare endTime: string;
}

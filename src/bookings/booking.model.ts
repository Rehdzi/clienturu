import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { Organization } from 'src/organization/organization.model';
import { Service } from 'src/services/service.model';

// Lifecycle status of a booking (запись).
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface BookingCreationAttrs {
  clientId: number;
  organizationId: number;
  serviceId: number;
  masterId: number;
  startTime: Date;
  endTime: Date;
  comment?: string;
}

// A client's booking of a service with a particular master for a concrete time slot.
// Timezone assumption: startTime/endTime are stored as UTC timestamps. The slot
// generator derives candidate slots by combining the booking's calendar date with
// the master's "HH:mm" working hours (interpreted in that same wall-clock frame),
// so the comparison is consistent on both the availability and create paths.
@Table({ tableName: 'bookings' })
export class Booking extends Model<Booking, BookingCreationAttrs> {
  @ApiProperty({ example: 1, description: 'Booking ID' })
  declare id: number;

  @ApiProperty({ example: 1, description: 'ID of the client (User) who made the booking' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare clientId: number;

  @BelongsTo(() => User, 'clientId')
  declare client: User;

  @ApiProperty({ example: 1, description: 'ID of the organization' })
  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare organizationId: number;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @ApiProperty({ example: 1, description: 'ID of the booked service' })
  @ForeignKey(() => Service)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare serviceId: number;

  @BelongsTo(() => Service)
  declare service: Service;

  @ApiProperty({ example: 1, description: 'ID of the master (User) who will perform the service' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare masterId: number;

  @BelongsTo(() => User, 'masterId')
  declare master: User;

  @ApiProperty({ example: '2026-05-24T09:00:00.000Z', description: 'Slot start (UTC)' })
  @Column({ type: DataType.DATE, allowNull: false })
  declare startTime: Date;

  @ApiProperty({ example: '2026-05-24T10:00:00.000Z', description: 'Slot end (UTC), derived from service duration' })
  @Column({ type: DataType.DATE, allowNull: false })
  declare endTime: Date;

  @ApiProperty({
    example: 'pending',
    description: 'Booking status',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @Column({
    type: DataType.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: BookingStatus;

  @ApiProperty({ example: 'Please use the parking entrance', description: 'Optional client comment', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  declare comment: string;
}

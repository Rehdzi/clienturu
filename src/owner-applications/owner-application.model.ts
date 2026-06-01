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

export type OwnerApplicationStatus = 'pending' | 'approved' | 'rejected';

interface OwnerApplicationCreationAttrs {
  userId: number;
  orgName: string;
  orgPhone: string;
  orgEmail?: string;
  addressCity: string;
  addressStreet: string;
  addressLabel?: string;
  latitude?: number;
  longitude?: number;
  comment?: string;
}

@Table({ tableName: 'owner_applications' })
export class OwnerApplication extends Model<
  OwnerApplication,
  OwnerApplicationCreationAttrs
> {
  @ApiProperty({ example: 1 })
  declare id: number;

  @ApiProperty({ example: 1, description: 'Applicant user id' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User, 'userId')
  declare applicant: User;

  @ApiProperty({ enum: ['pending', 'approved', 'rejected'], example: 'pending' })
  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: OwnerApplicationStatus;

  @ApiProperty({ example: 'My Salon' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare orgName: string;

  @ApiProperty({ example: '+79001234567' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare orgPhone: string;

  @ApiProperty({ example: 'info@salon.com', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  declare orgEmail: string | null;

  @ApiProperty({ example: 'Москва' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare addressCity: string;

  @ApiProperty({ example: 'ул. Тверская, 1' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare addressStreet: string;

  @ApiProperty({ example: 'Центральный филиал', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  declare addressLabel: string | null;

  @ApiProperty({ example: 55.7558, required: false })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare latitude: number | null;

  @ApiProperty({ example: 37.6173, required: false })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare longitude: number | null;

  @ApiProperty({ required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare comment: string | null;

  @ApiProperty({ required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare rejectionReason: string | null;

  @ApiProperty({ required: false })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare reviewedBy: number | null;

  @BelongsTo(() => User, 'reviewedBy')
  declare reviewer: User;

  @ApiProperty({ required: false })
  @Column({ type: DataType.DATE, allowNull: true })
  declare reviewedAt: Date | null;
}

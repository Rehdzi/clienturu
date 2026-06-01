import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Organization } from 'src/organization/organization.model';

interface AddressCreationAttrs {
  organizationId: number;
  city: string;
  street: string;
  label?: string;
  latitude?: number;
  longitude?: number;
  isPrimary?: boolean;
}

@Table({ tableName: 'addresses' })
export class Address extends Model<Address, AddressCreationAttrs> {
  @ApiProperty({ example: 1, description: 'Address ID' })
  declare id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the organization this address belongs to',
  })
  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER, allowNull: false, onDelete: 'CASCADE' })
  declare organizationId: number;

  @BelongsTo(() => Organization, { onDelete: 'CASCADE' })
  declare organization: Organization;

  @ApiProperty({ example: 'Москва', description: 'City' })
  // Indexed so public catalog filtering by city stays cheap as the table grows.
  @Column({ type: DataType.STRING, allowNull: false })
  declare city: string;

  @ApiProperty({
    example: 'ул. Тверская, д. 1',
    description: 'Street, building and (optional) suite as a single line',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  declare street: string;

  @ApiProperty({
    example: 'Центральный филиал',
    description: 'Optional branch label',
    required: false,
  })
  @Column({ type: DataType.STRING, allowNull: true })
  declare label: string | null;

  @ApiProperty({ example: 55.7558, description: 'Latitude', required: false })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare latitude: number | null;

  @ApiProperty({ example: 37.6173, description: 'Longitude', required: false })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  declare longitude: number | null;

  @ApiProperty({
    example: false,
    description: 'Whether this is the primary branch address',
  })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isPrimary: boolean;
}

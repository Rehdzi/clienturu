import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { Organization } from 'src/organization/organization.model';
import { Booking } from 'src/bookings/booking.model';

interface ReviewCreationAttrs {
  organizationId: number;
  clientId: number;
  rating: number;
  bookingId?: number;
  comment?: string;
}

// A client's rating (1-5) of an organization, optionally tied to the visit
// (booking) it came from. The organization's aggregate `rating` is recomputed
// from these rows on every create/delete.
@Table({ tableName: 'reviews' })
export class Review extends Model<Review, ReviewCreationAttrs> {
  @ApiProperty({ example: 1, description: 'Review ID' })
  declare id: number;

  @ApiProperty({ example: 1, description: 'ID of the reviewed organization' })
  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare organizationId: number;

  @BelongsTo(() => Organization)
  declare organization: Organization;

  @ApiProperty({ example: 1, description: 'ID of the client (User) leaving the review' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare clientId: number;

  @BelongsTo(() => User)
  declare client: User;

  @ApiProperty({ example: 1, description: 'ID of the booking this review came from', required: false })
  @ForeignKey(() => Booking)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare bookingId: number;

  @BelongsTo(() => Booking)
  declare booking: Booking;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare rating: number;

  @ApiProperty({ example: 'Great service!', description: 'Optional free-text comment', required: false })
  @Column({ type: DataType.STRING, allowNull: true })
  declare comment: string;
}

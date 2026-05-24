import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { User } from 'src/users/users/users.model';
import { Service } from 'src/services/service.model';
import { OrganizationStaff } from 'src/staff/organization-staff.model';
import { Review } from 'src/reviews/review.model';


interface OrgCreationAttrs {
  name: string;
  email?: string;
  phone: string;
  ownerId?: number;
}

@Table({ tableName: 'organizations' })
export class Organization extends Model<Organization, OrgCreationAttrs> {
    @ApiProperty({ example: 1, description: 'Organization ID' })
    declare id: number;

    @ApiProperty({ example: 'John Doe corp.', description: 'Organization name' })
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare name: string;

    @ApiProperty({ example: 'john.doe@company.com', description: 'Organization email' })
    @Column({ type: DataType.STRING, allowNull: true })
    declare email: string;

    @ApiProperty({ example: '+1234567890', description: 'Organization phone' })
    @Column({ type: DataType.STRING, allowNull: false })
    declare phone: string;

    @ApiProperty({ example: 4.5, description: 'Organization rating' })
    @Column({ type: DataType.DOUBLE, allowNull: true })
    declare rating: number;

    @ApiProperty({ example: 1, description: 'ID of the user who owns this organization' })
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare ownerId: number;

    @BelongsTo(() => User)
    declare owner: User;

    @HasMany(() => Service)
    declare services: Service[];

    // Masters (staff users) working at this organization, via the join table.
    @BelongsToMany(() => User, () => OrganizationStaff)
    declare staff: User[];

    @HasMany(() => Review)
    declare reviews: Review[];

    //TODO: Location, description, etc.
}

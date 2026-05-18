import { ApiProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';


interface OrgCreationAttrs {
  name: string;
  email?: string;
  phone: string;
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

    //TODO: Location, description, etc.
}

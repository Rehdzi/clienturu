import { ApiProperty } from "@nestjs/swagger";
import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

interface UserCreationAttrs {
    phone: string;
    name: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({example: 1, description: 'User ID'})      //  <-- Need to be made on all properties, but now I don't give a fuck.
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    phone: string;

    @Column({type: DataType.STRING, allowNull: false})
    name: string;

    @Column({type: DataType.STRING, allowNull: true})
    email: string;

    @Column({type: DataType.STRING, allowNull: true})
    password: string;


}
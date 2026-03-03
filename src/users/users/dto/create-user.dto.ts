import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'xxx-xxx-xx-xx', description: 'Phone number, without region code'})
    readonly phone: string;
    readonly name: string;
}
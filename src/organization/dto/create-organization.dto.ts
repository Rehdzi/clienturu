import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
    @ApiProperty({ example: 'John Doe corp.', description: 'Organization name' })
    @IsString()
    readonly name: string;

    @ApiProperty({ example: 'john.doe@company.com', description: 'Organization email', required: false })
    @IsOptional()
    @IsString()
    readonly email?: string;

    @ApiProperty({ example: '+1234567890', description: 'Organization phone' })
    @IsString()
    readonly phone: string;

    @ApiProperty({ example: 1, description: 'ID of the user who owns this organization', required: false })
    @IsOptional()
    @IsInt()
    readonly ownerId?: number;
}
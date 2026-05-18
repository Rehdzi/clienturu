import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organization')
export class OrganizationController {
    constructor(private organizationService: OrganizationService) {}

    @Get('all')
    async getAllOrganizations() {
        return this.organizationService.getAllOrganizations();
    }

    @Get(':id')
    async getOrganizationById(@Param('id') id: number) {
        return this.organizationService.getOrganizationById(id);
    }

    @Post('new')
    async createOrganization(@Body() dto: CreateOrganizationDto) {
        return this.organizationService.createOrganization(dto);
    }

}

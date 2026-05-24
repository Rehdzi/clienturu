import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller()
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post('services')
  async createService(@Body() dto: CreateServiceDto) {
    return this.servicesService.createService(dto);
  }

  // List services for a given organization, e.g. GET /organization/1/services
  @Get('organization/:id/services')
  async getOrganizationServices(@Param('id') id: number) {
    return this.servicesService.getServicesByOrganization(id);
  }

  // Alternative listing via query string, e.g. GET /services?organizationId=1
  @Get('services')
  async getServices(@Query('organizationId') organizationId: number) {
    return this.servicesService.getServicesByOrganization(organizationId);
  }

  @Get('services/:id')
  async getServiceById(@Param('id') id: number) {
    return this.servicesService.getServiceById(id);
  }

  @Patch('services/:id')
  async updateService(@Param('id') id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.updateService(id, dto);
  }

  @Delete('services/:id')
  async deleteService(@Param('id') id: number) {
    return this.servicesService.deleteService(id);
  }
}

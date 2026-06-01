import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Services')
@Controller()
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('services')
  async createService(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.servicesService.createService(dto, user);
  }

  // Public catalog: flat list of services across all active organizations.
  // Declared BEFORE `services/:id` so Nest's matcher does not treat "all" as an id.
  @ApiOperation({
    summary: 'Public service catalog with city / geo / search filters',
  })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Case-insensitive substring match against service name',
  })
  @Get('services/all')
  async getAllServices(
    @Query('city') city?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('q') q?: string,
  ) {
    return this.servicesService.getAllServices({
      city: city || undefined,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
      radiusKm: radiusKm !== undefined ? Number(radiusKm) : undefined,
      q: q || undefined,
    });
  }

  // List services for a given organization, e.g. GET /organization/1/services
  @ApiOperation({ summary: 'List services of an organization (public)' })
  @Get('organization/:id/services')
  async getOrganizationServices(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.getServicesByOrganization(id);
  }

  // Alternative listing via query string, e.g. GET /services?organizationId=1
  @Get('services')
  async getServices(@Query('organizationId') organizationId: number) {
    return this.servicesService.getServicesByOrganization(organizationId);
  }

  @Get('services/:id')
  async getServiceById(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.getServiceById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('services/:id')
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.servicesService.updateService(id, dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('services/:id')
  async deleteService(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.servicesService.deleteService(id, user);
  }
}

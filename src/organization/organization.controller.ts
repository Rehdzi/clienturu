import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ADMIN_ROLE_VALUE } from 'src/roles/roles.constants';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { OrganizationService } from './organization.service';

@ApiTags('Organizations')
@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  // Public catalog: only active organizations are returned. Filters are
  // applied at the DB level inside the service.
  @ApiOperation({
    summary: 'List active organizations with optional city / geo filters',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Case-insensitive exact match on address city',
  })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Free-text search across organization name and address city',
  })
  @Get('all')
  async getAllOrganizations(
    @Query('city') city?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('q') q?: string,
  ) {
    return this.organizationService.getAllOrganizations({
      city: city || undefined,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
      radiusKm: radiusKm !== undefined ? Number(radiusKm) : undefined,
      q: q || undefined,
    });
  }

  // Both `/mine` routes MUST be declared before `@Get(':id')` so the literal
  // 'mine' segment is never captured by the public `:id` param matcher.
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List organizations owned by the caller (all statuses); admins see all',
  })
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMyOrganizations(@CurrentUser() user: AccessTokenPayload) {
    return this.organizationService.getMyOrganizations(user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get an organization (any status) the caller owns; admins can see any org',
  })
  @UseGuards(JwtAuthGuard)
  @Get('mine/:id')
  async getMyOrganizationById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.organizationService.getMyOrganizationById(id, user);
  }

  @ApiOperation({ summary: 'Get an active organization (public)' })
  @Get(':id')
  async getOrganizationById(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.getOrganizationById(id);
  }

  // Direct org creation was replaced by the /owner-applications flow.

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending organization (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE_VALUE)
  @Patch(':id/approve')
  async approveOrganization(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.approveOrganization(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revert an organization back to pending (Admin only)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE_VALUE)
  @Patch(':id/reject')
  async rejectOrganization(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.rejectOrganization(id);
  }
}

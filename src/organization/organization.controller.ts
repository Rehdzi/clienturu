import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('new')
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.organizationService.createOrganization(dto, user);
  }
}

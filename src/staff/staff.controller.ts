import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { StaffService } from './staff.service';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { SetStaffServicesDto } from './dto/set-staff-services.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';

@Controller()
export class StaffController {
  constructor(private staffService: StaffService) {}

  // Assign a user as staff (master) of an organization.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('organization/:id/staff')
  async assignStaff(
    @Param('id') id: number,
    @Body() dto: AssignStaffDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.staffService.assignStaff(id, dto.userId, user);
  }

  // Remove a master from an organization.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('organization/:id/staff/:userId')
  async removeStaff(
    @Param('id') id: number,
    @Param('userId') userId: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.staffService.removeStaff(id, userId, user);
  }

  // List an organization's masters.
  @Get('organization/:id/staff')
  async getOrganizationStaff(@Param('id') id: number) {
    return this.staffService.getOrganizationStaff(id);
  }

  // Set the full set of services a master provides.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('staff/:userId/services')
  async setStaffServices(
    @Param('userId') userId: number,
    @Body() dto: SetStaffServicesDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.staffService.setStaffServices(userId, dto, user);
  }

  // Create/replace a master's weekly working hours.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('staff/:userId/schedule')
  async setSchedule(
    @Param('userId') userId: number,
    @Body() dto: SetScheduleDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.staffService.setSchedule(userId, dto, user);
  }

  // Read a master's weekly working hours.
  @Get('staff/:userId/schedule')
  async getSchedule(@Param('userId') userId: number) {
    return this.staffService.getSchedule(userId);
  }
}

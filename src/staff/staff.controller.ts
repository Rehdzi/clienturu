import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { SetStaffServicesDto } from './dto/set-staff-services.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';

@Controller()
export class StaffController {
  constructor(private staffService: StaffService) {}

  // Assign a user as staff (master) of an organization.
  @Post('organization/:id/staff')
  async assignStaff(@Param('id') id: number, @Body() dto: AssignStaffDto) {
    return this.staffService.assignStaff(id, dto.userId);
  }

  // Remove a master from an organization.
  @Delete('organization/:id/staff/:userId')
  async removeStaff(@Param('id') id: number, @Param('userId') userId: number) {
    return this.staffService.removeStaff(id, userId);
  }

  // List an organization's masters.
  @Get('organization/:id/staff')
  async getOrganizationStaff(@Param('id') id: number) {
    return this.staffService.getOrganizationStaff(id);
  }

  // Set the full set of services a master provides.
  @Post('staff/:userId/services')
  async setStaffServices(@Param('userId') userId: number, @Body() dto: SetStaffServicesDto) {
    return this.staffService.setStaffServices(userId, dto);
  }

  // Create/replace a master's weekly working hours.
  @Post('staff/:userId/schedule')
  async setSchedule(@Param('userId') userId: number, @Body() dto: SetScheduleDto) {
    return this.staffService.setSchedule(userId, dto);
  }

  // Read a master's weekly working hours.
  @Get('staff/:userId/schedule')
  async getSchedule(@Param('userId') userId: number) {
    return this.staffService.getSchedule(userId);
  }
}

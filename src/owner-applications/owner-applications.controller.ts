import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ADMIN_ROLE_VALUE, isAdmin } from 'src/roles/roles.constants';
import { CreateOwnerApplicationDto } from './dto/create-owner-application.dto';
import { RejectOwnerApplicationDto } from './dto/reject-owner-application.dto';
import type { OwnerApplicationStatus } from './owner-application.model';
import { OwnerApplicationsService } from './owner-applications.service';

@ApiTags('Owner Applications')
@ApiBearerAuth()
@Controller('owner-applications')
export class OwnerApplicationsController {
  constructor(private readonly service: OwnerApplicationsService) {}

  @ApiOperation({ summary: 'Submit an application to become an owner' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async submit(
    @Body() dto: CreateOwnerApplicationDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.service.submit(user.sub, dto);
  }

  @ApiOperation({ summary: 'List the caller’s own applications' })
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async listMine(@CurrentUser() user: AccessTokenPayload) {
    return this.service.listMine(user.sub);
  }

  @ApiOperation({ summary: 'Admin: list all applications (optional ?status)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE_VALUE)
  @Get()
  async listAll(@Query('status') status?: OwnerApplicationStatus) {
    return this.service.listAll({ status });
  }

  @ApiOperation({ summary: 'Get one application (admin or applicant)' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const adminCaller = isAdmin(user.roles);
    if (!adminCaller) {
      const app = await this.service.getById(id, user, false);
      if (app.userId !== user.sub) {
        throw new ForbiddenException('Not allowed');
      }
      return app;
    }
    return this.service.getById(id, user, true);
  }

  @ApiOperation({ summary: 'Admin: approve a pending application' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE_VALUE)
  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.service.approve(id, user);
  }

  @ApiOperation({ summary: 'Admin: reject a pending application' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE_VALUE)
  @Patch(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectOwnerApplicationDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.service.reject(id, user, dto.reason);
  }
}

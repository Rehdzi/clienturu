import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@Controller()
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  // Public: list every branch address of the organization. Used by the
  // pre-login catalog to render organization detail pages.
  @ApiOperation({ summary: 'List addresses of an organization (public)' })
  @Get('organization/:orgId/addresses')
  async getAddresses(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.addressesService.getAddressesForOrganization(orgId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create address (owner/admin only)' })
  @UseGuards(JwtAuthGuard)
  @Post('organization/:orgId/addresses')
  async createAddress(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateAddressDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.addressesService.createAddress(orgId, dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update address (owner/admin only)' })
  @UseGuards(JwtAuthGuard)
  @Patch('addresses/:id')
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.addressesService.updateAddress(id, dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete address (owner/admin only)' })
  @UseGuards(JwtAuthGuard)
  @Delete('addresses/:id')
  async deleteAddress(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.addressesService.deleteAddress(id, user);
  }
}

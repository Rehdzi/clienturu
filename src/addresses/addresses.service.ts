import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { OrganizationService } from 'src/organization/organization.service';
import { Address } from './address.model';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address) private addressRepository: typeof Address,
    private organizationService: OrganizationService,
    private sequelize: Sequelize,
  ) {}

  // Public read: listing addresses for an organization does not require auth.
  async getAddressesForOrganization(organizationId: number) {
    return this.addressRepository.findAll({
      where: { organizationId },
      order: [
        ['isPrimary', 'DESC'],
        ['id', 'ASC'],
      ],
    });
  }

  async createAddress(
    organizationId: number,
    dto: CreateAddressDto,
    user: AccessTokenPayload,
  ) {
    await this.organizationService.assertCanManage(organizationId, user);

    // When the new address is marked primary, demote every other address in the
    // same organization in the same transaction so the invariant "at most one
    // primary per org" can never be violated by interleaved requests.
    return this.sequelize.transaction(async (transaction) => {
      if (dto.isPrimary) {
        await this.addressRepository.update(
          { isPrimary: false },
          { where: { organizationId }, transaction },
        );
      }
      return this.addressRepository.create(
        { ...dto, organizationId },
        { transaction },
      );
    });
  }

  async updateAddress(
    id: number,
    dto: UpdateAddressDto,
    user: AccessTokenPayload,
  ) {
    const address = await this.addressRepository.findByPk(id);
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
    await this.organizationService.assertCanManage(
      address.organizationId,
      user,
    );

    return this.sequelize.transaction(async (transaction) => {
      if (dto.isPrimary) {
        await this.addressRepository.update(
          { isPrimary: false },
          {
            where: { organizationId: address.organizationId },
            transaction,
          },
        );
      }
      return address.update(dto, { transaction });
    });
  }

  async deleteAddress(id: number, user: AccessTokenPayload) {
    const address = await this.addressRepository.findByPk(id);
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
    await this.organizationService.assertCanManage(
      address.organizationId,
      user,
    );
    await address.destroy();
    return { id };
  }
}

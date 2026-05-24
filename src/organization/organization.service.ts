import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InjectModel } from '@nestjs/sequelize';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { isAdmin } from 'src/roles/roles.constants';
import { Organization } from './organization.model';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization)
    private organizationRepository: typeof Organization,
  ) {}

  // Single source of truth for org-ownership authorization. Throws 404 if the
  // organization is missing, 403 unless the user owns it (or is an Admin), and
  // otherwise returns the organization for the caller to use.
  async assertCanManage(
    organizationId: number,
    user: AccessTokenPayload,
  ): Promise<Organization> {
    const organization =
      await this.organizationRepository.findByPk(organizationId);
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    if (!isAdmin(user.roles) && organization.ownerId !== user.sub) {
      throw new ForbiddenException(
        'Only the organization owner can perform this action',
      );
    }
    return organization;
  }

  async createOrganization(dto: CreateOrganizationDto) {
    const organization = await this.organizationRepository.create(dto);
    return organization;
  }

  async getAllOrganizations() {
    return this.organizationRepository.findAll();
  }

  async getOrganizationById(id: number) {
    return this.organizationRepository.findByPk(id);
  }
}

import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Organization } from './organization.model';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization)
    private organizationRepository: typeof Organization,
  ) {}

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

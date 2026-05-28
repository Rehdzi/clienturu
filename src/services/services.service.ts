import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { OrganizationService } from 'src/organization/organization.service';
import { Service } from './service.model';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service) private serviceRepository: typeof Service,
    private organizationService: OrganizationService,
  ) {}

  async createService(dto: CreateServiceDto, user: AccessTokenPayload) {
    // Only the owner of the target organization (or an Admin) may add services.
    await this.organizationService.assertCanManage(dto.organizationId, user);
    const service = await this.serviceRepository.create(dto);
    return service;
  }

  async getServicesByOrganization(organizationId: number) {
    return this.serviceRepository.findAll({ where: { organizationId } });
  }

  async getServiceById(id: number) {
    const service = await this.serviceRepository.findByPk(id);
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  async updateService(
    id: number,
    dto: UpdateServiceDto,
    user: AccessTokenPayload,
  ) {
    const service = await this.getServiceById(id);
    await this.organizationService.assertCanManage(
      service.organizationId,
      user,
    );
    return service.update(dto);
  }

  async deleteService(id: number, user: AccessTokenPayload) {
    // Soft-delete: future bookings will reference services, so we must not orphan
    // historical data by hard-deleting. We simply mark the service inactive.
    const service = await this.getServiceById(id);
    await this.organizationService.assertCanManage(
      service.organizationId,
      user,
    );
    return service.update({ isActive: false });
  }
}

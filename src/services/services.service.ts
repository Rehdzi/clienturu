import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Service } from './service.model';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service) private serviceRepository: typeof Service,
  ) {}

  async createService(dto: CreateServiceDto) {
    // TODO: guard — only the organization owner should be able to create services
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

  async updateService(id: number, dto: UpdateServiceDto) {
    // TODO: guard — only the organization owner should be able to update services
    const service = await this.getServiceById(id);
    return service.update(dto);
  }

  async deleteService(id: number) {
    // TODO: guard — only the organization owner should be able to delete services
    // Soft-delete: future bookings will reference services, so we must not orphan
    // historical data by hard-deleting. We simply mark the service inactive.
    const service = await this.getServiceById(id);
    return service.update({ isActive: false });
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Service } from 'src/services/service.model';
import { Schedule } from 'src/staff/schedule.model';
import { StaffService as StaffServiceModel } from 'src/staff/staff-service.model';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { isAdmin } from 'src/roles/roles.constants';
import { OrganizationService } from 'src/organization/organization.service';
import { Organization } from 'src/organization/organization.model';
import { User } from 'src/users/users/users.model';
import { Booking, BookingStatus } from './booking.model';
import { CreateBookingDto } from './dto/create-booking.dto';

// Allowed status transitions. Any (from -> to) pair not listed here is illegal.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking) private bookingRepository: typeof Booking,
    @InjectModel(Service) private serviceRepository: typeof Service,
    @InjectModel(Schedule) private scheduleRepository: typeof Schedule,
    @InjectModel(StaffServiceModel)
    private staffServiceRepository: typeof StaffServiceModel,
    @InjectModel(Organization)
    private organizationRepository: typeof Organization,
    // Used to gate org-scoped reads on owner/admin authorization.
    private organizationService: OrganizationService,
  ) {}

  // ---- Pure helpers (no DB access) ----------------------------------------

  // Two half-open intervals [aStart, aEnd) and [bStart, bEnd) overlap iff each
  // one starts strictly before the other ends. Touching edges (aEnd === bStart)
  // do NOT overlap, so a 10:00 booking is free immediately after a 09:00-10:00 one.
  static overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return (
      aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime()
    );
  }

  // Build a UTC Date from a "YYYY-MM-DD" calendar date and an "HH:mm" wall-clock
  // time. Working hours and stored timestamps are compared in this same UTC frame.
  static combineDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  }

  // Generate every candidate slot start within [workStart, workEnd) such that a
  // full service of durationMinutes fits before workEnd, then drop any slot that
  // overlaps an existing (non-cancelled) booking. Returns free slot start times.
  static generateFreeSlots(
    workStart: Date,
    workEnd: Date,
    durationMinutes: number,
    existing: { startTime: Date; endTime: Date }[],
  ): Date[] {
    const free: Date[] = [];
    const durationMs = durationMinutes * 60_000;

    let cursor = workStart.getTime();
    while (cursor + durationMs <= workEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor + durationMs);

      const taken = existing.some((b) =>
        BookingsService.overlaps(slotStart, slotEnd, b.startTime, b.endTime),
      );
      if (!taken) {
        free.push(slotStart);
      }
      cursor += durationMs;
    }

    return free;
  }

  // ---- DB-backed operations -----------------------------------------------

  private async getServiceOrThrow(serviceId: number): Promise<Service> {
    const service = await this.serviceRepository.findByPk(serviceId);
    if (!service) {
      throw new NotFoundException(`Service with id ${serviceId} not found`);
    }
    return service;
  }

  private async assertMasterProvidesService(
    masterId: number,
    serviceId: number,
  ): Promise<void> {
    const link = await this.staffServiceRepository.findOne({
      where: { userId: masterId, serviceId },
    });
    if (!link) {
      throw new BadRequestException(
        `Master ${masterId} does not provide service ${serviceId}`,
      );
    }
  }

  // Existing bookings for a master that could collide within [from, to), i.e. any
  // non-cancelled booking whose interval overlaps the window. Shared by both the
  // availability listing and create-booking validation so they can never disagree.
  private async getActiveBookingsInWindow(
    masterId: number,
    from: Date,
    to: Date,
  ) {
    return this.bookingRepository.findAll({
      where: {
        masterId,
        status: { [Op.ne]: 'cancelled' },
        startTime: { [Op.lt]: to },
        endTime: { [Op.gt]: from },
      },
    });
  }

  async getAvailableSlots(
    masterId: number,
    serviceId: number,
    date: string,
  ): Promise<string[]> {
    const service = await this.getServiceOrThrow(serviceId);
    await this.assertMasterProvidesService(masterId, serviceId);

    // dayOfWeek 0 (Sunday) .. 6 (Saturday), matching the Schedule model.
    const dayOfWeek = BookingsService.combineDateTime(
      date,
      '00:00',
    ).getUTCDay();

    const schedule = await this.scheduleRepository.findOne({
      where: { userId: masterId, dayOfWeek },
    });
    if (!schedule) {
      // Master does not work that weekday: no slots.
      return [];
    }

    const workStart = BookingsService.combineDateTime(date, schedule.startTime);
    const workEnd = BookingsService.combineDateTime(date, schedule.endTime);

    const existing = await this.getActiveBookingsInWindow(
      masterId,
      workStart,
      workEnd,
    );

    const slots = BookingsService.generateFreeSlots(
      workStart,
      workEnd,
      service.durationMinutes,
      existing,
    );

    return slots.map((s) => s.toISOString());
  }

  async createBooking(
    dto: CreateBookingDto,
    user: AccessTokenPayload,
  ): Promise<Booking> {
    // The client is always the authenticated user — never trust a body-supplied
    // id, which would let one user book on another's behalf.
    const clientId = user.sub;
    const service = await this.getServiceOrThrow(dto.serviceId);
    await this.assertMasterProvidesService(dto.masterId, dto.serviceId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60_000,
    );

    // Reject bookings in the past.
    if (startTime.getTime() <= Date.now()) {
      throw new BadRequestException('Cannot create a booking in the past');
    }

    // Re-run the overlap check server-side; never trust the client's claim that a
    // slot is free. Uses the same window query as availability listing.
    const existing = await this.getActiveBookingsInWindow(
      dto.masterId,
      startTime,
      endTime,
    );
    const conflict = existing.some((b) =>
      BookingsService.overlaps(startTime, endTime, b.startTime, b.endTime),
    );
    if (conflict) {
      throw new ConflictException('The requested slot is no longer available');
    }

    return this.bookingRepository.create({
      clientId,
      organizationId: service.organizationId,
      serviceId: dto.serviceId,
      masterId: dto.masterId,
      startTime,
      endTime,
      comment: dto.comment,
    });
  }

  // A booking is "owned" by: the client, the master, the org that owns the
  // service, and any Admin. The org owner is allowed so the calendar UI can
  // transition statuses without being a direct booking participant.
  private async assertParticipant(
    booking: Booking,
    user: AccessTokenPayload,
  ): Promise<void> {
    if (isAdmin(user.roles)) return;
    if (booking.clientId === user.sub || booking.masterId === user.sub) return;

    const service = await this.serviceRepository.findByPk(booking.serviceId, {
      attributes: ['id', 'organizationId'],
    });
    if (service?.organizationId) {
      const org = await this.organizationRepository.findByPk(
        service.organizationId,
        { attributes: ['id', 'ownerId'] },
      );
      if (org?.ownerId === user.sub) return;
    }

    throw new ForbiddenException('You are not a participant in this booking');
  }

  async getBookingById(id: number, user: AccessTokenPayload): Promise<Booking> {
    const booking = await this.bookingRepository.findByPk(id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    await this.assertParticipant(booking, user);
    return booking;
  }

  async getBookingsByClient(
    clientId: number,
    user: AccessTokenPayload,
  ): Promise<Booking[]> {
    // Only the client themselves (or an Admin) may list a client's bookings.
    if (!isAdmin(user.roles) && clientId !== user.sub) {
      throw new ForbiddenException("You cannot list another client's bookings");
    }
    return this.bookingRepository.findAll({
      where: { clientId },
      order: [['startTime', 'ASC']],
    });
  }

  async getBookingsByMaster(
    masterId: number,
    user: AccessTokenPayload,
  ): Promise<Booking[]> {
    // Only the master themselves (or an Admin) may list a master's bookings.
    if (!isAdmin(user.roles) && masterId !== user.sub) {
      throw new ForbiddenException("You cannot list another master's bookings");
    }
    return this.bookingRepository.findAll({
      where: { masterId },
      order: [['startTime', 'ASC']],
    });
  }

  // Owner-side calendar feed: every booking for any service of this org that
  // overlaps the [from, to) window. Authorization is delegated to
  // OrganizationService.assertCanManage (owner or admin).
  async getBookingsByOrganization(
    organizationId: number,
    user: AccessTokenPayload,
    range: { from?: string; to?: string },
  ): Promise<Booking[]> {
    await this.organizationService.assertCanManage(organizationId, user);

    // Default to the current ISO week (Monday 00:00 UTC) + 7 days.
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday .. 6 = Saturday
    const daysFromMonday = (day + 6) % 7;
    const defaultFrom = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - daysFromMonday,
        0,
        0,
        0,
        0,
      ),
    );
    const from = range.from ? new Date(range.from) : defaultFrom;
    const to = range.to
      ? new Date(range.to)
      : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.bookingRepository.findAll({
      where: { startTime: { [Op.gte]: from, [Op.lt]: to } },
      include: [
        {
          // Scope to this organization by filtering on the joined Service row.
          model: Service,
          required: true,
          where: { organizationId },
          attributes: ['id', 'name', 'durationMinutes', 'price'],
        },
        {
          model: User,
          as: 'master',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['startTime', 'ASC']],
    });
  }

  async updateStatus(
    id: number,
    status: BookingStatus,
    user: AccessTokenPayload,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findByPk(id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    // Only a participant (client or master) or an Admin may change the status.
    await this.assertParticipant(booking, user);

    if (booking.status === status) {
      throw new BadRequestException(`Booking is already '${status}'`);
    }

    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed.includes(status)) {
      throw new ConflictException(
        `Illegal status transition: '${booking.status}' -> '${status}'`,
      );
    }

    return booking.update({ status });
  }
}

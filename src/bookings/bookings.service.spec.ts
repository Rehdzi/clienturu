import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenPayload } from '../auth/interfaces/jwt-payload.interface';
import { Service } from '../services/service.model';
import { Schedule } from '../staff/schedule.model';
import { StaffService as StaffServiceModel } from '../staff/staff-service.model';
import { Organization } from '../organization/organization.model';
import { OrganizationService } from '../organization/organization.service';
import { Booking } from './booking.model';
import { BookingsService } from './bookings.service';

// An Admin actor bypasses the participant/identity checks so these tests can
// focus on the booking logic itself (slot validation, status lifecycle).
const actor: AccessTokenPayload = {
  sub: 5,
  phone: '0000000000',
  roles: ['Admin'],
  type: 'access',
};

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: {
    findAll: jest.Mock;
    create: jest.Mock;
    findByPk: jest.Mock;
  };
  let serviceRepository: { findByPk: jest.Mock };
  let scheduleRepository: { findOne: jest.Mock };
  let staffServiceRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    bookingRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    };
    serviceRepository = { findByPk: jest.fn() };
    scheduleRepository = { findOne: jest.fn() };
    staffServiceRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getModelToken(Booking), useValue: bookingRepository },
        { provide: getModelToken(Service), useValue: serviceRepository },
        { provide: getModelToken(Schedule), useValue: scheduleRepository },
        {
          provide: getModelToken(StaffServiceModel),
          useValue: staffServiceRepository,
        },
        // Used by assertParticipant to allow the org owner to act on bookings.
        {
          provide: getModelToken(Organization),
          useValue: { findByPk: jest.fn() },
        },
        // Test double for the org-authorization helper used by org-scoped reads.
        {
          provide: OrganizationService,
          useValue: { assertCanManage: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---- Pure slot-generation helper ---------------------------------------

  describe('generateFreeSlots', () => {
    it('yields 09:00, 10:00, 11:00 for a 09:00-12:00 day with a 60-min service', () => {
      const date = '2026-05-25';
      const workStart = BookingsService.combineDateTime(date, '09:00');
      const workEnd = BookingsService.combineDateTime(date, '12:00');

      const slots = BookingsService.generateFreeSlots(
        workStart,
        workEnd,
        60,
        [],
      );

      expect(slots.map((s) => s.toISOString())).toEqual([
        '2026-05-25T09:00:00.000Z',
        '2026-05-25T10:00:00.000Z',
        '2026-05-25T11:00:00.000Z',
      ]);
    });

    it('removes a booked slot from the result (booking 10:00 removes 10:00)', () => {
      const date = '2026-05-25';
      const workStart = BookingsService.combineDateTime(date, '09:00');
      const workEnd = BookingsService.combineDateTime(date, '12:00');
      const booked = [
        {
          startTime: BookingsService.combineDateTime(date, '10:00'),
          endTime: BookingsService.combineDateTime(date, '11:00'),
        },
      ];

      const slots = BookingsService.generateFreeSlots(
        workStart,
        workEnd,
        60,
        booked,
      );

      expect(slots.map((s) => s.toISOString())).toEqual([
        '2026-05-25T09:00:00.000Z',
        '2026-05-25T11:00:00.000Z',
      ]);
    });

    it('treats touching edges as non-overlapping', () => {
      const a = BookingsService.combineDateTime('2026-05-25', '09:00');
      const aEnd = BookingsService.combineDateTime('2026-05-25', '10:00');
      const b = BookingsService.combineDateTime('2026-05-25', '10:00');
      const bEnd = BookingsService.combineDateTime('2026-05-25', '11:00');
      expect(BookingsService.overlaps(a, aEnd, b, bEnd)).toBe(false);
    });
  });

  // ---- getAvailableSlots integrates the helper with the repos -------------

  it('getAvailableSlots returns 09:00 and 11:00 when 10:00 is already booked', async () => {
    const date = '2026-05-25'; // a Monday -> dayOfWeek 1
    serviceRepository.findByPk.mockResolvedValue({
      id: 1,
      durationMinutes: 60,
      organizationId: 1,
    });
    staffServiceRepository.findOne.mockResolvedValue({
      userId: 1,
      serviceId: 1,
    });
    scheduleRepository.findOne.mockResolvedValue({
      startTime: '09:00',
      endTime: '12:00',
    });
    bookingRepository.findAll.mockResolvedValue([
      {
        startTime: BookingsService.combineDateTime(date, '10:00'),
        endTime: BookingsService.combineDateTime(date, '11:00'),
      },
    ]);

    const slots = await service.getAvailableSlots(1, 1, date);

    expect(slots).toEqual([
      '2026-05-25T09:00:00.000Z',
      '2026-05-25T11:00:00.000Z',
    ]);
  });

  // ---- Double-booking rejection on create ---------------------------------

  it('createBooking rejects an overlapping slot with a ConflictException', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow, not in the past
    serviceRepository.findByPk.mockResolvedValue({
      id: 1,
      durationMinutes: 60,
      organizationId: 1,
    });
    staffServiceRepository.findOne.mockResolvedValue({
      userId: 1,
      serviceId: 1,
    });
    bookingRepository.findAll.mockResolvedValue([
      {
        startTime: new Date(start.getTime()),
        endTime: new Date(start.getTime() + 60 * 60 * 1000),
      },
    ]);

    await expect(
      service.createBooking(
        {
          serviceId: 1,
          masterId: 1,
          startTime: start.toISOString(),
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it('createBooking persists when the slot is free', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    serviceRepository.findByPk.mockResolvedValue({
      id: 1,
      durationMinutes: 60,
      organizationId: 1,
    });
    staffServiceRepository.findOne.mockResolvedValue({
      userId: 1,
      serviceId: 1,
    });
    bookingRepository.findAll.mockResolvedValue([]);
    bookingRepository.create.mockResolvedValue({ id: 99 });

    const result = await service.createBooking(
      {
        serviceId: 1,
        masterId: 1,
        startTime: start.toISOString(),
      },
      actor,
    );

    expect(result).toEqual({ id: 99 });
    expect(bookingRepository.create).toHaveBeenCalledTimes(1);
  });

  // ---- Status lifecycle ----------------------------------------------------

  it('updateStatus allows pending -> confirmed', async () => {
    const update = jest.fn().mockResolvedValue({ id: 1, status: 'confirmed' });
    bookingRepository.findByPk.mockResolvedValue({
      id: 1,
      status: 'pending',
      update,
    });

    await service.updateStatus(1, 'confirmed', actor);

    expect(update).toHaveBeenCalledWith({ status: 'confirmed' });
  });

  it('updateStatus rejects an illegal transition (pending -> completed)', async () => {
    const update = jest.fn();
    bookingRepository.findByPk.mockResolvedValue({
      id: 1,
      status: 'pending',
      update,
    });

    await expect(
      service.updateStatus(1, 'completed', actor),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });

  it('updateStatus rejects transitions out of a terminal state (completed -> anything)', async () => {
    const update = jest.fn();
    bookingRepository.findByPk.mockResolvedValue({
      id: 1,
      status: 'completed',
      update,
    });

    await expect(
      service.updateStatus(1, 'cancelled', actor),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update).not.toHaveBeenCalled();
  });
});

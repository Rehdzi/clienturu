import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Organization } from '../organization/organization.model';
import { Review } from './review.model';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findByPk: jest.Mock;
    findOne: jest.Mock;
  };
  let organizationRepository: { update: jest.Mock };

  // Mutable in-memory store the AVG aggregate reads from, so the recompute
  // helper exercises real arithmetic rather than a hard-coded value.
  let rows: { organizationId: number; rating: number }[];

  beforeEach(async () => {
    rows = [];

    const avgFor = (organizationId: number): string | null => {
      const matching = rows.filter((r) => r.organizationId === organizationId);
      if (matching.length === 0) return null;
      const sum = matching.reduce((acc, r) => acc + r.rating, 0);
      return String(sum / matching.length);
    };

    reviewRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(({ where }: { where: { organizationId: number } }) =>
        Promise.resolve({ avgRating: avgFor(where.organizationId) }),
      ),
    };
    organizationRepository = { update: jest.fn().mockResolvedValue([1]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getModelToken(Review), useValue: reviewRepository },
        {
          provide: getModelToken(Organization),
          useValue: organizationRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('recomputes org rating to 4.5 after reviews of 4 and 5 are created', async () => {
    reviewRepository.create.mockImplementation(
      (dto: { organizationId: number; rating: number }) => {
        rows.push({ organizationId: dto.organizationId, rating: dto.rating });
        return Promise.resolve({ id: rows.length, ...dto });
      },
    );

    await service.createReview({ organizationId: 1, clientId: 10, rating: 4 });
    await service.createReview({ organizationId: 1, clientId: 11, rating: 5 });

    expect(organizationRepository.update).toHaveBeenLastCalledWith(
      { rating: 4.5 },
      { where: { id: 1 } },
    );
  });

  it('updates the rating when one review is deleted', async () => {
    rows = [
      { organizationId: 1, rating: 4 },
      { organizationId: 1, rating: 5 },
    ];
    // Deleting the rating-4 review leaves only a 5.
    reviewRepository.findByPk.mockResolvedValue({
      id: 1,
      organizationId: 1,
      destroy: jest.fn().mockImplementation(() => {
        rows = rows.filter((r) => r.rating !== 4);
        return Promise.resolve();
      }),
    });

    await service.deleteReview(1);

    expect(organizationRepository.update).toHaveBeenLastCalledWith(
      { rating: 5 },
      { where: { id: 1 } },
    );
  });

  it('sets rating to null when the last review is deleted', async () => {
    rows = [{ organizationId: 1, rating: 5 }];
    reviewRepository.findByPk.mockResolvedValue({
      id: 1,
      organizationId: 1,
      destroy: jest.fn().mockImplementation(() => {
        rows = [];
        return Promise.resolve();
      }),
    });

    await service.deleteReview(1);

    expect(organizationRepository.update).toHaveBeenLastCalledWith(
      { rating: null },
      { where: { id: 1 } },
    );
  });

  it('throws NotFoundException when deleting a missing review', async () => {
    reviewRepository.findByPk.mockResolvedValue(null);

    await expect(service.deleteReview(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(organizationRepository.update).not.toHaveBeenCalled();
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { fn, col } from 'sequelize';
import { Organization } from 'src/organization/organization.model';
import { Review } from './review.model';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review) private reviewRepository: typeof Review,
    @InjectModel(Organization) private organizationRepository: typeof Organization,
  ) {}

  async createReview(dto: CreateReviewDto): Promise<Review> {
    // TODO: guard — only a client with a 'completed' booking at this org should
    // be allowed to review it (rule deliberately not hard-blocked yet).
    const review = await this.reviewRepository.create(dto);
    await this.recomputeRating(dto.organizationId);
    return review;
  }

  async getReviewsForOrganization(organizationId: number): Promise<Review[]> {
    return this.reviewRepository.findAll({
      where: { organizationId },
      order: [['id', 'DESC']],
    });
  }

  async deleteReview(id: number): Promise<void> {
    // TODO: guard — only the review's author (or org owner/admin) should delete it.
    const review = await this.reviewRepository.findByPk(id);
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    const { organizationId } = review;
    await review.destroy();
    await this.recomputeRating(organizationId);
  }

  // Single source of truth for keeping Organization.rating in sync. Reused by
  // both create and delete so the two paths can never diverge. We compute the
  // average with a DB-side AVG aggregate instead of loading every review row
  // into memory — this stays cheap as the review count grows. If an org has no
  // reviews we set rating to null (rather than 0) so "no data" is distinct from
  // "rated zero", which a 1-5 scale can never actually produce.
  private async recomputeRating(organizationId: number): Promise<void> {
    const result = (await this.reviewRepository.findOne({
      attributes: [[fn('AVG', col('rating')), 'avgRating']],
      where: { organizationId },
      raw: true,
    })) as unknown as { avgRating: string | null } | null;

    const avg = result?.avgRating;
    const rating = avg === null || avg === undefined ? null : Math.round(Number(avg) * 10) / 10;

    // `rating` is declared `number` on the model but the column is nullable
    // ("no reviews" => null), so we cast to satisfy the update typing.
    await this.organizationRepository.update(
      { rating: rating as number },
      { where: { id: organizationId } },
    );
  }
}

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Create a review (rating 1-5 validated by the DTO).
  @Post('reviews')
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  // List all reviews for a given organization.
  @Get('organization/:id/reviews')
  async getOrganizationReviews(@Param('id') id: number) {
    return this.reviewsService.getReviewsForOrganization(id);
  }

  // Remove a review; triggers a rating recompute for its organization.
  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: number) {
    return this.reviewsService.deleteReview(id);
  }
}

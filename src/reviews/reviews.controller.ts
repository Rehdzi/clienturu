import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Create a review (rating 1-5 validated by the DTO). Author taken from token.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  async createReview(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.reviewsService.createReview(dto, user);
  }

  // List all reviews for a given organization. Public.
  @Get('organization/:id/reviews')
  async getOrganizationReviews(@Param('id') id: number) {
    return this.reviewsService.getReviewsForOrganization(id);
  }

  // Remove a review; triggers a rating recompute for its organization.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:id')
  async deleteReview(
    @Param('id') id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.reviewsService.deleteReview(id, user);
  }
}

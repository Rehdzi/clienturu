import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Organization } from 'src/organization/organization.model';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './review.model';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [SequelizeModule.forFeature([Review, Organization])],
  exports: [ReviewsService],
})
export class ReviewsModule {}

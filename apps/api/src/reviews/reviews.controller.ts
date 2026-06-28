import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review for a completed booking' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get all reviews for a vehicle with average rating' })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.reviewsService.findByVehicle(vehicleId);
  }

  @Get('renter/:renterId')
  @ApiOperation({ summary: 'Get all reviews for a renter fleet with average rating' })
  findByRenter(@Param('renterId') renterId: string) {
    return this.reviewsService.findByRenter(renterId);
  }
}

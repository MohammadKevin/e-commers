import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Get,
  Query,
} from '@nestjs/common';
import { SellerApplicationsService } from './seller-applications.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GlobalRole, ApplicationStatus } from '@prisma/client';

@ApiTags('Seller Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seller-applications')
export class SellerApplicationsController {
  constructor(
    private readonly sellerApplicationsService: SellerApplicationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all seller applications (SUPER_ADMIN only)' })
  @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false })
  findAll(
    @CurrentUser('globalRole') role: GlobalRole,
    @Query('status') status?: ApplicationStatus,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can view seller applications.',
      );
    }
    return this.sellerApplicationsService.findAll(status);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become a seller' })
  apply(
    @CurrentUser('id') userId: string,
    @Body() applySellerDto: ApplySellerDto,
  ) {
    return this.sellerApplicationsService.apply(userId, applySellerDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a seller application (SUPER_ADMIN only)' })
  approve(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can approve seller applications.',
      );
    }
    return this.sellerApplicationsService.approve(id);
  }
}

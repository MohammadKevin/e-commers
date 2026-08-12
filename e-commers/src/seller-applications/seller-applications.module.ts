import { Module } from '@nestjs/common';
import { SellerApplicationsController } from './seller-applications.controller';
import { SellerApplicationsService } from './seller-applications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerApplicationsController],
  providers: [SellerApplicationsService],
})
export class SellerApplicationsModule {}

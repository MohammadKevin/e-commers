import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { ApplicationStatus, GlobalRole, StoreRole } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SellerApplicationsService {
  private readonly logger = new Logger(SellerApplicationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, applySellerDto: ApplySellerDto) {
    // Check if user already has a pending or approved application
    const existing = await this.prisma.sellerApplication.findFirst({
      where: {
        userId,
        status: { in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED] },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You already have a pending or approved seller application.',
      );
    }

    // Check if store name is taken
    const storeExists = await this.prisma.store.findUnique({
      where: { name: applySellerDto.storeName },
    });
    if (storeExists) {
      throw new BadRequestException('Store name is already taken.');
    }

    // Create the application
    return this.prisma.sellerApplication.create({
      data: {
        userId,
        storeName: applySellerDto.storeName,
        description: applySellerDto.description,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  async findAll(status?: ApplicationStatus) {
    return this.prisma.sellerApplication.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(applicationId: string) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Seller application not found.');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        `Application is already ${application.status}.`,
      );
    }

    // Wrap in a transaction to ensure atomicity
    return this.prisma.$transaction(async (prisma) => {
      // 1. Update application status
      const updatedApp = await prisma.sellerApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      });

      // 2. Update user role
      await prisma.user.update({
        where: { id: application.userId },
        data: { globalRole: GlobalRole.SELLER },
      });

      // 3. Create the store and assign user as OWNER
      // Generate a basic slug from store name
      const slug = application.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      await prisma.store.create({
        data: {
          name: application.storeName,
          slug: slug,
          description: application.description,
          members: {
            create: {
              userId: application.userId,
              role: StoreRole.OWNER,
            },
          },
        },
      });

      return updatedApp;
    });
  }

  // Cron job that runs every hour to reject applications older than 48 hours
  @Cron(CronExpression.EVERY_HOUR)
  async autoRejectPendingApplications() {
    this.logger.log(
      'Running 48-hour SLA check for pending seller applications...',
    );
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 48);

    const expiredApplications = await this.prisma.sellerApplication.findMany({
      where: {
        status: ApplicationStatus.PENDING,
        createdAt: {
          lt: expirationDate,
        },
      },
    });

    if (expiredApplications.length === 0) {
      return;
    }

    // Update statuses to REJECTED
    const ids = expiredApplications.map((app) => app.id);
    const result = await this.prisma.sellerApplication.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: ApplicationStatus.REJECTED,
        reviewedAt: new Date(),
      },
    });

    this.logger.log(
      `Auto-rejected ${result.count} expired seller application(s).`,
    );
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminStats() {
    const usersCount = await this.prisma.user.count();
    const storesCount = await this.prisma.store.count();
    const ordersCount = await this.prisma.order.count();
    const revenueAgg = await this.prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    return {
      users: usersCount,
      stores: storesCount,
      orders: ordersCount,
      revenue: revenueAgg._sum.totalAmount || 0,
    };
  }

  async createStaff(createStaffDto: CreateStaffDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createStaffDto.email },
          ...(createStaffDto.phone ? [{ phone: createStaffDto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email atau nomor telepon sudah digunakan');
    }

    const passwordHash = await bcrypt.hash(createStaffDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: createStaffDto.email,
        passwordHash,
        fullName: createStaffDto.fullName,
        phone: createStaffDto.phone,
        globalRole: createStaffDto.globalRole,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        globalRole: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  async getStaff() {
    return this.prisma.user.findMany({
      where: {
        globalRole: {
          in: ['FINANCE_ADMIN', 'OPERATIONS_CS', 'MARKETING_ADMIN'],
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        globalRole: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBuyers() {
    return this.prisma.user.findMany({
      where: {
        globalRole: 'USER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        tier: true,
        createdAt: true,
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        globalRole: true,
        tier: true,
        isAffiliate: true,
        createdAt: true,
        addresses: true,
        stores: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const ownedStores = (user.stores || []).map((sm) => ({
      ...sm.store,
      userRole: sm.role,
    }));

    return {
      ...user,
      ownedStores,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        globalRole: true,
        tier: true,
        updatedAt: true,
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isPrimary) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    if (dto.isPrimary) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { message: 'Alamat berhasil dihapus' };
  }

  // --- ADMIN METHODS ---

  async updateUserAdmin(id: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async deleteUserAdmin(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

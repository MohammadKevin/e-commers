import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UsersService } from './users.service';
import { GlobalRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-staff')
  @ApiOperation({ summary: 'Membuat akun staf (khusus SUPER_ADMIN)' })
  createStaff(
    @CurrentUser('globalRole') role: GlobalRole,
    @Body() dto: CreateStaffDto,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Hanya SUPER_ADMIN yang dapat membuat akun staf',
      );
    }
    // Pastikan role yang dikirim valid (bukan USER, SELLER, dll jika diperlukan, namun sudah di validasi enum di DTO)
    return this.usersService.createStaff(dto);
  }

  @Get('staff')
  @ApiOperation({
    summary: 'Mendapatkan daftar staf internal (khusus SUPER_ADMIN)',
  })
  getStaff(@CurrentUser('globalRole') role: GlobalRole) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Hanya SUPER_ADMIN yang dapat melihat daftar staf',
      );
    }
    return this.usersService.getStaff();
  }

  @Get('buyers')
  @ApiOperation({ summary: 'Mendapatkan daftar pembeli (khusus SUPER_ADMIN)' })
  getBuyers(@CurrentUser('globalRole') role: GlobalRole) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Hanya SUPER_ADMIN yang dapat melihat daftar pengguna',
      );
    }
    return this.usersService.getBuyers();
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Mendapatkan statistik platform untuk admin' })
  getAdminStats() {
    return this.usersService.getAdminStats();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Mendapatkan profil pengguna' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Mengubah profil pengguna' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Daftar alamat pengiriman pengguna' })
  getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Tambah alamat pengiriman baru' })
  createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.createAddress(userId, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update alamat pengiriman' })
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Hapus alamat pengiriman' })
  deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  // --- ADMIN ENDPOINTS ---

  @Patch(':id/admin')
  @ApiOperation({ summary: 'Update pengguna (khusus SUPER_ADMIN)' })
  updateUserAdmin(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.usersService.updateUserAdmin(id, dto);
  }

  @Delete(':id/admin')
  @ApiOperation({ summary: 'Hapus pengguna (khusus SUPER_ADMIN)' })
  deleteUserAdmin(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.usersService.deleteUserAdmin(id);
  }
}

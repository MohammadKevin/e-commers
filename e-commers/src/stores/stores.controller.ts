import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreAdminDto } from './dto/update-store-admin.dto';
import { StoresService } from './stores.service';

import { GlobalRole } from '@prisma/client';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({
    summary: 'Dapatkan daftar seluruh toko (khusus SUPER_ADMIN)',
  })
  getAllAdminStores(@CurrentUser('globalRole') role: GlobalRole) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Hanya SUPER_ADMIN yang dapat melihat seluruh toko',
      );
    }
    return this.storesService.getAllAdminStores();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Buat toko baru (Multi-vendor Seller)' })
  createStore(@CurrentUser('id') userId: string, @Body() dto: CreateStoreDto) {
    return this.storesService.createStore(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-stores')
  @ApiOperation({ summary: 'Dapatkan daftar toko milik pengguna' })
  getMyStores(@CurrentUser('id') userId: string) {
    return this.storesService.getMyStores(userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Dapatkan detail publik toko berdasarkan slug' })
  getStoreBySlug(@Param('slug') slug: string) {
    return this.storesService.getStoreBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update informasi toko' })
  updateStore(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(userId, storeId, dto);
  }

  // --- ADMIN ENDPOINTS ---

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/admin')
  @ApiOperation({ summary: 'Update toko (khusus SUPER_ADMIN)' })
  updateStoreAdmin(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
    @Body() dto: UpdateStoreAdminDto,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.storesService.updateStoreAdmin(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/admin')
  @ApiOperation({ summary: 'Hapus toko (khusus SUPER_ADMIN)' })
  deleteStoreAdmin(
    @CurrentUser('globalRole') role: GlobalRole,
    @Param('id') id: string,
  ) {
    if (role !== GlobalRole.SUPER_ADMIN) {
      throw new ForbiddenException('Akses ditolak');
    }
    return this.storesService.deleteStoreAdmin(id);
  }
}

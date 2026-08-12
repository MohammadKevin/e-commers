import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Toko Berkah Utama' })
  @IsString()
  @IsNotEmpty({ message: 'Nama toko wajib diisi' })
  name: string;

  @ApiPropertyOptional({ example: 'toko-berkah-utama', description: 'Jika tidak diisi akan di-generate otomatis dari nama toko' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-)' })
  slug?: string;

  @ApiPropertyOptional({ example: 'Toko penyedia kebutuhan fashion terlengkap' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Jakarta Barat' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'DKI Jakarta' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: '11480' })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { GlobalRole } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({ description: 'Email pengguna staf' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password untuk akun staf' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Nama lengkap staf' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Nomor telepon staf' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description:
      'Peran global staf (contoh: FINANCE_ADMIN, OPERATIONS_CS, MARKETING_ADMIN)',
  })
  @IsEnum(GlobalRole)
  globalRole: GlobalRole;
}

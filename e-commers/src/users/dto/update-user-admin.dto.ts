import { IsEnum, IsOptional } from 'class-validator';
import { GlobalRole, UserTier } from '@prisma/client';

export class UpdateUserAdminDto {
  @IsEnum(GlobalRole)
  @IsOptional()
  globalRole?: GlobalRole;

  @IsEnum(UserTier)
  @IsOptional()
  tier?: UserTier;
}

import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStoreAdminDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isOfficial?: boolean;
}

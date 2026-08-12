import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplySellerDto {
  @ApiProperty({ description: 'The desired name of the store' })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({
    description: 'Optional description for the store',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

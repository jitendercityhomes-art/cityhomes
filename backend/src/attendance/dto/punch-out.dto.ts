import { IsNumber, IsString, IsOptional } from 'class-validator';

export class PunchOutDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber()
  branchId?: number;
}

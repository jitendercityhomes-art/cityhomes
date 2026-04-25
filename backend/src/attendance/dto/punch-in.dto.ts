import { IsNumber, IsString, IsOptional } from 'class-validator';

export class PunchInDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsNumber()
  branchId: number;
}

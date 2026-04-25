import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum AttendanceType {
  IN = 'in',
  OUT = 'out',
}

export class PunchAttendanceDto {
  @IsNotEmpty()
  @IsEnum(AttendanceType)
  type: AttendanceType;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

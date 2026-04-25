import { IsString, IsOptional, IsArray, IsBoolean, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  week_off_days?: number[];
  // Array of day numbers: 0=Sunday, 1=Monday, ... 6=Saturday

  @IsOptional()
  @IsString()
  punch_in_time?: string;

  @IsOptional()
  @IsString()
  punch_out_time?: string;

  @IsOptional()
  @IsString()
  half_day_punch_out_before?: string;

  @IsOptional()
  @IsString()
  half_day_punch_in_after?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

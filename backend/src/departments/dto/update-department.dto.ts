import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  week_off_days?: number[];

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

import { IsString, IsInt, IsOptional, IsBoolean, IsArray, Min, Max } from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  name: string;

  @IsString()
  date: string; // ISO date format: YYYY-MM-DD

  @IsInt()
  @Min(1900)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(1)
  @Max(31)
  day: number;

  @IsOptional()
  @IsString()
  type?: string;
  // 'paid' | 'optional' | 'unpaid'

  @IsOptional()
  @IsString()
  applicable_to?: string;
  // 'all' | 'department'

  @IsOptional()
  @IsArray()
  department_ids?: string[];

  @IsOptional()
  @IsBoolean()
  is_recurring_yearly?: boolean;
}

import { IsString, IsDateString, IsOptional, MinLength } from 'class-validator';

export class CreateLeaveDto {
  @IsString()
  type: string;
  // 'Casual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Other'

  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  reason?: string;
}

import { IsString, IsOptional, IsEnum, IsISO8601, ValidateIf } from 'class-validator';

export class EditAttendanceDto {
  @IsEnum(['present', 'half_day', 'absent', 'week_off', 'holiday', 'paid_leave', 'unpaid_leave', 'half_day_leave'])
  status: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsISO8601()
  punchInTime?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsISO8601()
  punchOutTime?: string | null;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  editReason: string;
}

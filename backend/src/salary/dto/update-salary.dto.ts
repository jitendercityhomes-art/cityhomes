import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSalaryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  basic_salary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  house_rent_allowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dearness_allowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  incentive?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pf_deduction?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esi_deduction?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tds_deduction?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  professional_tax?: number;
}

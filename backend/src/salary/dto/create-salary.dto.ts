import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateSalaryDto {
  @IsNumber()
  @Min(0)
  basic_salary: number;

  @IsNumber()
  @Min(0)
  house_rent_allowance: number;

  @IsNumber()
  @Min(0)
  dearness_allowance: number;

  @IsNumber()
  @Min(0)
  bonus: number;

  @IsNumber()
  @Min(0)
  overtime: number;

  @IsNumber()
  @Min(0)
  incentive: number;

  @IsNumber()
  @Min(0)
  pf_deduction: number;

  @IsNumber()
  @Min(0)
  esi_deduction: number;

  @IsNumber()
  @Min(0)
  tds_deduction: number;

  @IsNumber()
  @Min(0)
  professional_tax: number;

  @IsOptional()
  @IsDateString()
  effective_from?: string;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { SalaryGrade } from '../entities/salary-structure.entity';

export class CreateSalaryStructureDto {
  @IsNotEmpty()
  @IsNumber()
  gradeId: number;

  @IsNotEmpty()
  @IsEnum(SalaryGrade)
  grade: SalaryGrade;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  houseRentAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  medicalAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specialAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  providentFund?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalTax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxDeductedAtSource?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSalaryStructureDto {
  @IsOptional()
  @IsEnum(SalaryGrade)
  grade?: SalaryGrade;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basicSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  houseRentAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  medicalAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  specialAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  providentFund?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  professionalTax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxDeductedAtSource?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  isActive?: boolean;
}

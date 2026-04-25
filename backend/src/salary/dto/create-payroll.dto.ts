import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { PayrollStatus } from '../entities/payroll.entity';

export class CreatePayrollDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @IsOptional()
  @IsNumber()
  houseRentAllowance?: number;

  @IsOptional()
  @IsNumber()
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  medicalAllowance?: number;

  @IsOptional()
  @IsNumber()
  specialAllowance?: number;

  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @IsOptional()
  @IsNumber()
  providentFundDeduction?: number;

  @IsOptional()
  @IsNumber()
  professionalTaxDeduction?: number;

  @IsOptional()
  @IsNumber()
  taxDeductedAtSourceDeduction?: number;

  @IsOptional()
  @IsNumber()
  unpaidLeaveDeduction?: number;

  @IsOptional()
  @IsNumber()
  otherDeductions?: number;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  salaryStructureId?: number;
}

export class UpdatePayrollDto {
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @IsOptional()
  @IsNumber()
  otherDeductions?: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class ProcessPayrollDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;
}

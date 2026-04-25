import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { SalaryStructure } from './salary-structure.entity';

export enum PayrollStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('payroll')
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  employeeId: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  houseRentAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  transportAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  medicalAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  specialAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  providentFundDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  professionalTaxDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxDeductedAtSourceDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unpaidLeaveDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netPay: number;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.PENDING,
  })
  status: PayrollStatus;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  bankAccountNumber: string;

  @Column({ type: 'text', nullable: true })
  ifscCode: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employeeId' })
  employee: User;

  @ManyToOne(() => SalaryStructure)
  @JoinColumn({ name: 'salaryStructureId' })
  salaryStructure: SalaryStructure;

  @Column({ nullable: true })
  salaryStructureId: number;
}

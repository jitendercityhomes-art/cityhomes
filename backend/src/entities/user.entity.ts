import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Department } from '../departments/entities/department.entity';
import { Branch } from '../branches/branch.entity';
import { SalaryStructure } from '../salary/entities/salary-structure.entity';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  HR = 'hr',
  EMPLOYEE = 'employee',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: true })
  employee_id?: string; // Auto-generated: EMP001, EMP002...

  @Column({ unique: true })
  email: string;

  @Column({ default: '' })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ nullable: true })
  designation: string; // Job title

  @Column({ nullable: true })
  gender: string; // Male, Female, Other

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basic_salary: number;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
    nullable: true,
  })
  employment_type: EmploymentType;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  date_of_joining: Date;

  @Column({ nullable: true })
  marital_status: string;

  @Column({ nullable: true })
  blood_group: string;

  @Column({ nullable: true })
  emergency_contact_name: string;

  @Column({ nullable: true })
  emergency_contact_phone: string;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: true })
  bank_account: string;

  @Column({ nullable: true })
  bank_ifsc: string;

  @Column({ nullable: true })
  bank_branch: string;

  @Column({ nullable: true })
  bank_account_holder: string;

  @Column({ nullable: true })
  upi_id: string;

  @Column({ nullable: true })
  pan_number: string;

  @Column({ nullable: true })
  aadhaar_number: string;

  @Column({ nullable: true })
  passbook_photo_url: string;

  @Column({ nullable: true })
  uan_number: string;

  @Column({ type: 'text', nullable: true })
  address: string; // Full address

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ type: 'int', nullable: true })
  department_id?: number;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'int', nullable: true })
  branch_id?: number;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Attendance[];

  @ManyToOne(() => SalaryStructure, { nullable: true })
  salaryStructure: SalaryStructure;

  @Column({ type: 'int', nullable: true })
  salary_structure_id?: number;
}

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

export enum SalaryGrade {
  TRAINEE = 'TRAINEE',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
  SENIOR_MANAGER = 'SENIOR_MANAGER',
  DIRECTOR = 'DIRECTOR',
}

@Entity('salary_structures')
export class SalaryStructure {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basic: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  hra: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  da: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overtime: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  incentive: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pf_deduction: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  esi_deduction: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tds_deduction: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  professional_tax: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    asExpression: 'basic + hra + da + bonus + overtime + incentive',
    generatedType: 'STORED',
  })
  gross_salary: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    asExpression: 'basic + hra + da + bonus + overtime + incentive - pf_deduction - esi_deduction - tds_deduction - professional_tax',
    generatedType: 'STORED',
  })
  net_salary: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;
  // null means currently active

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

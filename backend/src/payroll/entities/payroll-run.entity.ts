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

@Entity('payroll_runs')
export class PayrollRun {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int', default: 0 })
  present_days: number;

  @Column({ type: 'int', default: 0 })
  week_off_days: number;

  @Column({ type: 'int', default: 0 })
  paid_holiday_days: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  half_days: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  half_day_leave_days: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  paid_leave_days: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  unpaid_leave_days: number;

  @Column({ type: 'int', default: 0 })
  absent_days: number;

  @Column({ type: 'int', default: 0 })
  lop_days: number; // Loss of pay days

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basic_earned: number;

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
  gross_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  reimbursement_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  net_payable: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;
  // 'pending' | 'paid' | 'on_hold'

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

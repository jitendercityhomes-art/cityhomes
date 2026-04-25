import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('salary_settings')
export class SalarySettings {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 20, default: 'calendar' })
  period_type: string;
  // 'calendar' = actual month days | 'fixed' = fixed days count

  @Column({ type: 'int', default: 26 })
  fixed_days: number;

  @Column({ type: 'int', default: 1 })
  cycle_start_day: number;

  @Column({ type: 'int', default: 31 })
  cycle_end_day: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.5 })
  overtime_rate: number;

  @Column({ type: 'varchar', length: 20, default: 'paid' })
  holiday_policy: string;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  @UpdateDateColumn()
  updated_at: Date;
}

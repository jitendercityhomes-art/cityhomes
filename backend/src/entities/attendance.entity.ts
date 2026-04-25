import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Branch } from '../branches/branch.entity';

@Entity('attendance')
@Unique(['employee_id', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'date' })
  @Index()
  date: string; // 'YYYY-MM-DD'

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  @Index()
  status: string;
  // 'present' | 'half_day' | 'absent' | 'week_off' | 'holiday' | 'paid_leave' | 'unpaid_leave' | 'pending'

  // Punch In
  @Column({ type: 'timestamptz', nullable: true })
  punch_in_time: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  punch_in_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  punch_in_lng: number;

  @Column({ type: 'text', nullable: true })
  punch_in_address: string;

  @Column({ type: 'text', nullable: true })
  punch_in_photo_url: string;

  @Column({ type: 'int', nullable: true })
  punch_in_branch_id: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'punch_in_branch_id' })
  branch: Branch;

  // Punch Out
  @Column({ type: 'timestamptz', nullable: true })
  punch_out_time: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  punch_out_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  punch_out_lng: number;

  @Column({ type: 'text', nullable: true })
  punch_out_address: string;

  @Column({ type: 'text', nullable: true })
  punch_out_photo_url: string;

  @Column({ type: 'boolean', default: false })
  punch_out_auto: boolean;

  // Calculated fields
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  working_hours: number;

  @Column({ type: 'boolean', default: false })
  is_late: boolean;

  // Edit tracking
  @Column({ type: 'int', nullable: true })
  edited_by: number;

  @Column({ type: 'timestamptz', nullable: true })
  edited_at: Date;

  @Column({ type: 'text', nullable: true })
  edit_reason: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  original_status: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

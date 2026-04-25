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

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'varchar', length: 30 })
  type: string;
  // 'Casual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Other'

  @Column({ type: 'date' })
  from_date: Date;

  @Column({ type: 'date' })
  to_date: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;
  // 'pending' | 'approved' | 'rejected'

  @Column({ type: 'int', nullable: true })
  approved_by: number;

  @Column({ type: 'text', nullable: true })
  rejected_reason: string;

  @CreateDateColumn()
  created_at: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { User } from './user.entity';

@Entity('attendance_settings')
export class AttendanceSettings {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true })
  branch_id: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'time', default: '09:30:00' })
  office_start_time: string;

  @Column({ type: 'time', default: '12:00:00' })
  half_day_cutoff: string;

  @Column({ type: 'time', default: '23:59:00' })
  auto_punch_out_time: string;

  @Column({ type: 'boolean', default: true })
  geofence_required: boolean;

  @Column({ type: 'boolean', default: true })
  selfie_required: boolean;

  @Column({ type: 'int', nullable: true })
  updated_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

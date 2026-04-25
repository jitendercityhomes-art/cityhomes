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

@Entity('reimbursements')
export class Reimbursement {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  receipt_url: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;
  // 'pending' | 'approved' | 'rejected'

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'int', nullable: true })
  approved_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

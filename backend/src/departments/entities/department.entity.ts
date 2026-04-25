import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToMany(() => User, user => user.department)
  employees: User[];

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', array: true, default: '{}' })
  week_off_days: number[];
  // Array of day numbers: 0=Sunday, 1=Monday, ... 6=Saturday
  // Example: [0, 6] means Sunday and Saturday off

  @Column({ type: 'time', default: '09:00:00' })
  punch_in_time: string;

  @Column({ type: 'time', default: '18:00:00' })
  punch_out_time: string;

  @Column({ type: 'time', default: '14:00:00' })
  half_day_punch_out_before: string;

  @Column({ type: 'time', default: '12:00:00' })
  half_day_punch_in_after: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  department_code: string;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

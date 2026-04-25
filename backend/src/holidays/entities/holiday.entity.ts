import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  day: number;

  @Column({ type: 'varchar', length: 20, default: 'paid' })
  type: string;
  // Types: 'paid' | 'optional' | 'unpaid'

  @Column({ type: 'varchar', length: 20, default: 'all' })
  applicable_to: string;
  // 'all' | 'department'

  @Column({ type: 'int', array: true, default: '{}' })
  department_ids: number[];
  // If applicable_to='department', specific department IDs

  @Column({ type: 'boolean', default: true })
  is_recurring_yearly: boolean;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true })
  actor_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actor_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actor_role: string;

  @Column({ type: 'varchar', length: 200 })
  action: string;

  @Column({ type: 'text', nullable: true })
  detail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @CreateDateColumn()
  created_at: Date;
}

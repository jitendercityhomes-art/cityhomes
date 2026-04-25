import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../entities/user.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToMany(() => User, user => user.branch)
  employees: User[];

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  branch_code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  lng: number;

  @Column({ type: 'int', default: 200 })
  radius: number; // meters

  @Column({ type: 'varchar', length: 20, default: '#00A884' })
  color: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}

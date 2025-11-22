import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
@Entity('role')
export class Role {
  
    @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: false })
  updatedAt: Date;
}
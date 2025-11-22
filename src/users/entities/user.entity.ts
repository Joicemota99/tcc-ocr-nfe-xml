
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Role } from 'src/roles/entities/role.entity';

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

   @Column({ type: 'uuid', nullable: true }) 
  companyId: string;
  
  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: 'RESTRICT'
})
  company: Company; 

  @Column({ type: 'uuid', nullable: true }) 
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users) 
  role: Role; 

  @Column({ type: 'varchar', unique: true }) 
  email: string;

  @Column({ type: 'varchar' }) 
  encrypted_password: string;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile; 

  @CreateDateColumn({ name: 'created_at' }) 
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) 
  updatedAt: Date;
}

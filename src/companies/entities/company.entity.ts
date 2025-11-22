import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CompanySupplier } from 'src/companies-suppliers/entities/company-supplier.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
@Entity('companies')
export class Company {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => CompanySupplier, (supplier) => supplier.company)
  suppliers: CompanySupplier[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  
  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices: Invoice[];


  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 18, unique: true, nullable: false })
  cnpj: string;


  @Column({ type: 'varchar', length: 255, nullable: true })
  nameFantasy: string;


  @CreateDateColumn({ type: 'timestamp with time zone', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: false })
  updatedAt: Date;
}
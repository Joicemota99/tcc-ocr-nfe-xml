import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Company } from '../../companies/entities/company.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';

@Entity('companies_suppliers')
export class CompanySupplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, (company) => company.suppliers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  company: Company;

  @OneToMany(() => Invoice, (invoice) => invoice.supplier)
  invoices: Invoice[];

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  name_fantasy: string;

  @Column({ length: 18 })
  cnpj: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Product, (product) => product.company_supplier)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

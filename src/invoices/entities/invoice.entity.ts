import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { CompanySupplier } from '../../companies-suppliers/entities/company-supplier.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Empresa dona do sistema (compradora)
  @ManyToOne(() => Company, (company) => company.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  company: Company;

  // Fornecedor emissor da nota
  @ManyToOne(() => CompanySupplier, (supplier) => supplier.invoices, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  supplier: CompanySupplier;

  @Column({ length: 50 })
  invoice_number: string;

  @Column({ length: 20, nullable: true })
  series?: string;

  @Column({ type: 'date', nullable: true })
  issue_date?: Date;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total_amount: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanySupplier } from '../../companies-suppliers/entities/company-supplier.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FK para o fornecedor (companies_suppliers)
  @ManyToOne(() => CompanySupplier, (supplier) => supplier.products, {
    nullable: false,
    onDelete: 'RESTRICT', // não deixa apagar fornecedor se tiver produtos
  })

  @JoinColumn({ name: 'company_suppliers_id' })
  company_supplier: CompanySupplier;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  barcode?: string;

  @Column({ length: 50, nullable: true })
  unit_of_measure?: string; // ex: UN, CX, KG

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  coast_price?: number; // custo do produto

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  sale_price_suggested?: number;

  @Column({ type: 'int', default: 0 })
  current_stock_quantity: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

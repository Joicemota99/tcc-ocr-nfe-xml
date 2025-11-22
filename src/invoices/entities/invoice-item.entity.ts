import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  invoice: Invoice;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  product: Product;


  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total_price: number;

  @Column({ length: 50, nullable: true })
  unit_of_measure?: string;

  @Column({ length: 255, nullable: true })
  barcode?: string;
}

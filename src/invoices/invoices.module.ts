import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Company } from '../companies/entities/company.entity';
import { CompanySupplier } from '../companies-suppliers/entities/company-supplier.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Company,
      CompanySupplier,
      Product,
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [TypeOrmModule],
})
export class InvoicesModule {}

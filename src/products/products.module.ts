import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { CompanySupplier } from '../companies-suppliers/entities/company-supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, CompanySupplier])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule],
})
export class ProductsModule {}

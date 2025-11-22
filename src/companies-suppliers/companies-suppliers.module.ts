import { Module } from '@nestjs/common';
import { CompaniesSuppliersService } from './companies-suppliers.service';
import { CompaniesSuppliersController } from './companies-suppliers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySupplier } from './entities/company-supplier.entity';
import { Company } from '../companies/entities/company.entity';


@Module({
  imports: [TypeOrmModule.forFeature([CompanySupplier, Company])],
  controllers: [CompaniesSuppliersController],
  providers: [CompaniesSuppliersService],
  exports: [TypeOrmModule],
})
export class CompaniesSuppliersModule {}


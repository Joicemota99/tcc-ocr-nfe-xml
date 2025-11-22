
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UserProfile } from 'src/users/entities/user-profile.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Company } from 'src/companies/entities/company.entity';
import { CompanySupplier } from 'src/companies-suppliers/entities/company-supplier.entity';
import { Product } from 'src/products/entities/product.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { InvoiceItem } from 'src/invoices/entities/invoice-item.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, UserProfile, Role, Company, CompanySupplier, Product, Invoice, InvoiceItem], 
    synchronize: true, 
    logging: true, 
  }),
);

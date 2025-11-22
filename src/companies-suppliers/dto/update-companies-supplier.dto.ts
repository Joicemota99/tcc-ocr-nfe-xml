import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanySupplierDto } from './create-companies-supplier.dto';
import { IsOptional, IsString } from 'class-validator';
import { IsCnpj } from '../validators/is-cnpj.validator';

export class UpdateCompanySupplierDto extends PartialType(CreateCompanySupplierDto) {
  @IsOptional() @IsString() @IsCnpj()
  cnpj?: string;
}

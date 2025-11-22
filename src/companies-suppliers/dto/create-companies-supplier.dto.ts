import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsCnpj } from '../validators/is-cnpj.validator';

export class CreateCompanySupplierDto {
  @IsNotEmpty() @IsString()
  companyId: string; // UUID da company

  @IsNotEmpty() @IsString() @MaxLength(255)
  name: string;

  @IsNotEmpty() @IsString() @MaxLength(255)
  name_fantasy: string;

  @IsNotEmpty() @IsString() @IsCnpj()
  cnpj: string;

  @IsOptional() @IsBoolean()
  is_active?: boolean = true;
}

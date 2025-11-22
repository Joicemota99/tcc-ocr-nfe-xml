import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SupplierXmlDto {
  @IsString()
  name: string;

  @IsString()
  name_fantasy: string;

  @IsString()
  cnpj: string;
}

class InvoiceItemXmlDto {
  @IsString()
  product_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  unit_of_measure?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

  @IsNumber()
  total_price: number;
}

export class CreateInvoiceFromXmlDto {
  @ValidateNested()
  @Type(() => SupplierXmlDto)
  supplier: SupplierXmlDto;

  @IsString()
  invoice_number: string;

  @IsString()
  series: string;

  @IsOptional()
  @IsString()
  issue_date?: string;

  @IsNumber()
  total_amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemXmlDto)
  items: InvoiceItemXmlDto[];
}

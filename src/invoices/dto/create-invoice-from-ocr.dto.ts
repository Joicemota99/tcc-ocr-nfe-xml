import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Dados do fornecedor vindo do OCR
class OcrSupplierDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(18)
  cnpj: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255
  )
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_fantasy: string;
}

// Item da nota vindo do OCR
class OcrInvoiceItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  product_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  barcode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit_of_measure?: string; // ex: UN, CX, KG

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total_price: number;
}

export class CreateInvoiceFromOcrDto {
  // Empresa dona do sistema (compradora)

  @ValidateNested()
  @Type(() => OcrSupplierDto)
  supplier: OcrSupplierDto;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  invoice_number: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  series?: string;

  @IsOptional()
  @IsDateString()
  issue_date?: string; // formato YYYY-MM-DD

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total_amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OcrInvoiceItemDto)
  items: OcrInvoiceItemDto[];
}

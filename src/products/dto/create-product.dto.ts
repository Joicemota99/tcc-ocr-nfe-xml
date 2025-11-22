import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  companySupplierId: string; // UUID do fornecedor (companies_suppliers)

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  coast_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sale_price_suggested?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_stock_quantity?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

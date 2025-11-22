// src/companies/dto/company-response.dto.ts
import { IsUUID, IsString, MaxLength } from 'class-validator';

export class CompanyResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  nameFantasy: string;

  @IsString()
  @MaxLength(14, {message:'O CNPJ deve ter 14 números'})
  cnpj: string;
  
}
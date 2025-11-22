
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class OnboardCompanyDto {
  // Empresa
  @IsNotEmpty() name: string;
  @IsOptional() cnpj?: string;

  // Usuário Admin
  @IsNotEmpty() full_name: string;

  @IsEmail() email: string;
  @MinLength(6) password: string;
  @IsOptional() phone?: string;
}

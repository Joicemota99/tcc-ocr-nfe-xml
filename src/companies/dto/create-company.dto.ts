import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: 'O nome da empresa não pode conter caracters especiais.' })
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  @Length(1, 255)
  name: string;

  @IsString({ message: 'O CNPJ não pode conter caracters especiais.' })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório.' })
  // O CNPJ no formato 'XX.XXX.XXX/XXXX-XX' tem 18 caracteres.
  // Se for salvo limpo (apenas números), use Length(14, 14).
  @Length(14, 14, { message: 'O CNPJ deve ter exatamente 14 dígitos (apenas números).' })
  cnpj: string; 

  @IsString({ message: 'O nome fantasia deve ser conter de 1 à 255 caracters.' })
  @IsOptional() // Nulo (opcional)
  @Length(1, 255)
  nameFantasy?: string;
}
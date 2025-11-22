import { IsOptional, IsString, Length } from 'class-validator';


export class UpdateCompanyDto {
  
  // Opcional: O cliente pode não enviar este campo
  @IsOptional() 
  @IsString({ message: 'O nome da empresa deve ser uma string.' })
  @Length(1, 255)
  name?: string; 

  // Opcional: O cliente pode não enviar este campo
  @IsOptional()
  @IsString({ message: 'O CNPJ deve ser uma string.' })
  @Length(14, 14, { message: 'O CNPJ deve ter exatamente 14 dígitos (apenas números).' })
  cnpj?: string; 

  // Opcional: O cliente pode não enviar este campo
  @IsOptional()
  @IsString({ message: 'O nome fantasia deve ser uma string.' })
  @Length(1, 255)
  nameFantasy?: string; 

}
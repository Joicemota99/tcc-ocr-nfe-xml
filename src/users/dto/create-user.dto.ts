
import { IsEmail, IsOptional, IsString, IsUUID, MinLength, IsNotEmpty} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'A senha deve ter no minimo 6 caracters.' })
  password: string;

  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsNotEmpty({ message: 'O ID da empresa é obrigatório.' })
  companyId: string;

  @IsNotEmpty({ message: 'O ID do cargo é obrigatório.' })
  @IsUUID('4', { message: 'O ID do cargo deve ser um UUID válido.' })
  roleId: string;
}

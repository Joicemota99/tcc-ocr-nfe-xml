import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional() 
  @IsString()
  name?: string; 

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'A descrição deve ter no máximo 100 caracteres' })
  description?: string; 
}
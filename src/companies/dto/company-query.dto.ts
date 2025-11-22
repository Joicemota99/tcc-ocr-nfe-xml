import { IsOptional, IsString, IsNumberString } from 'class-validator';

/**
 * Define os parâmetros que podem ser enviados na URL (Query Params)
 */
export class CompanyQueryDto {
  /**
   * PAGINAÇÃO
   */
  @IsOptional()
  @IsNumberString()
  limit?: string; // Número de itens por página (ex: 10)

  @IsOptional()
  @IsNumberString()
  page?: string; // Número da página a ser exibida (ex: 1)

  /**
   * FILTROS
   */
  @IsOptional()
  @IsString({ message: 'O filtro de nome deve ser uma string.' })
  name?: string; // Filtrar por nome (busca parcial)

  @IsOptional()
  @IsString({ message: 'O filtro de CNPJ deve ser uma string.' })
  cnpj?: string; // Filtrar por CNPJ (busca exata ou parcial)
}
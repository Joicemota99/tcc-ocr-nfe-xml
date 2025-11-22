
import { CompanyDto } from './company.dto'; 

export interface PaginatedCompanies {
  data: CompanyDto[]; // Lista de empresas mapeadas para DTO
  total: number; // Número total de registros encontrados (sem limite/offset)
  page: number; // Página atual
  lastPage: number; // Última página
}
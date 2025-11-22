// src/companies/dto/company.dto.ts

import { Company } from '../entities/company.entity';

export class CompanyDto {
  id: string;
  name: string;
  cnpj: string;
  nameFantasy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(company: Company) {
    this.id = company.id;
    this.name = company.name;
    this.cnpj = company.cnpj;
    this.nameFantasy = company.nameFantasy;
    this.createdAt = company.createdAt;
    this.updatedAt = company.updatedAt;
  }
}
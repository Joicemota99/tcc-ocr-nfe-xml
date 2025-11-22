import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySupplier } from './entities/company-supplier.entity';
import { CreateCompanySupplierDto } from './dto/create-companies-supplier.dto';
import { UpdateCompanySupplierDto } from './dto/update-companies-supplier.dto';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class CompaniesSuppliersService {
  constructor(
    @InjectRepository(CompanySupplier)
    private readonly repo: Repository<CompanySupplier>,

    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
  ) {}

  async create(dto: CreateCompanySupplierDto) {
    try {
      const company = await this.companies.findOne({ where: { id: dto.companyId } });
      if (!company) throw new BadRequestException('Empresa (companyId) não encontrada');

      const exists = await this.repo.findOne({
        where: { company: { id: dto.companyId }, cnpj: dto.cnpj },
        relations: ['company'],
      });
      if (exists) throw new BadRequestException('Fornecedor já cadastrado para esta empresa (CNPJ duplicado)');

      const entity = this.repo.create({
        company,
        name: dto.name,
        name_fantasy: dto.name_fantasy,
        cnpj: dto.cnpj,
        is_active: dto.is_active ?? true,
      });

      return await this.repo.save(entity);
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro interno ao criar fornecedor');
    }
  }

  async findAll(companyId: string, isActive?: boolean, q?: string) {
  // Se não enviou companyId, lista todos (com empresa)
  if (!companyId) {
    const where: any = {};
    if (typeof isActive === 'boolean') where.is_active = isActive;

    return this.repo.find({
      where,
      relations: ['company'],
      order: { name_fantasy: 'ASC' },
    });
  }

  // Com companyId, mantém o filtro atual
  const qb = this.repo.createQueryBuilder('s')
    .leftJoin('s.company', 'c')
    .where('c.id = :companyId', { companyId });

  if (typeof isActive === 'boolean') qb.andWhere('s.is_active = :isActive', { isActive });
  if (q) qb.andWhere('(s.name ILIKE :q OR s.name_fantasy ILIKE :q OR s.cnpj ILIKE :q)', { q: `%${q}%` });

  return qb.orderBy('s.name_fantasy', 'ASC').getMany();
}


  async findOne(id: string) {
    try {
      const supplier = await this.repo.findOne({ where: { id }, relations: ['company'] });
      if (!supplier) throw new NotFoundException('Fornecedor não encontrado');
      return supplier;
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro interno ao buscar fornecedor');
    }
  }

  async update(id: string, dto: UpdateCompanySupplierDto) {
    try {
      const supplier = await this.findOne(id);

      if (dto.cnpj && dto.cnpj !== supplier.cnpj) {
        const dup = await this.repo.findOne({
          where: { company: { id: supplier.company.id }, cnpj: dto.cnpj },
          relations: ['company'],
        });
        if (dup) throw new BadRequestException('Já existe fornecedor com este CNPJ para a mesma empresa');
      }

      Object.assign(supplier, {
        name: dto.name ?? supplier.name,
        name_fantasy: dto.name_fantasy ?? supplier.name_fantasy,
        cnpj: dto.cnpj ?? supplier.cnpj,
        is_active: dto.is_active ?? supplier.is_active,
      });

      return await this.repo.save(supplier);
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro interno ao atualizar fornecedor');
    }
  }

  async setStatus(id: string, is_active: boolean) {
    try {
      const supplier = await this.findOne(id);
      supplier.is_active = is_active;
      return await this.repo.save(supplier);
    } catch (error) {
      console.error('Erro ao alterar status do fornecedor:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro interno ao alterar status');
    }
  }

  async linkSupplierToCompany(supplierId: string, companyId: string) {
  // 1) Carrega fornecedor atual
  const supplier = await this.repo.findOne({ where: { id: supplierId }, relations: ['company'] });
  if (!supplier) throw new NotFoundException('Fornecedor não encontrado');

  // 2) Carrega a empresa alvo
  const company = await this.companies.findOne({ where: { id: companyId } });
  if (!company) throw new NotFoundException('Empresa não encontrada');

  // 3) Impede duplicidade: mesmo CNPJ já cadastrado nessa empresa
  const duplicated = await this.repo.findOne({
    where: { company: { id: companyId }, cnpj: supplier.cnpj },
    relations: ['company'],
  });
  if (duplicated) {
    throw new BadRequestException('Já existe fornecedor com este CNPJ nesta empresa');
  }

  // 4) Vincula e salva
  supplier.company = company;
  return this.repo.save(supplier);
}

//consultar a empresa de um fornecedor
async getCompanyBySupplierId(supplierId: string) {
  const supplier = await this.repo.findOne({
    where: { id: supplierId },
    relations: ['company'],
  });
  if (!supplier) throw new NotFoundException('Fornecedor não encontrado');

  const { id, name, cnpj, nameFantasy } = supplier.company;
  return { id, name, cnpj, nameFantasy };
}

}

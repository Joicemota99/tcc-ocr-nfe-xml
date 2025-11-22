
import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm'; 
import * as bcrypt from 'bcrypt';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyDto } from './dto/company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { OnboardCompanyDto } from './dto/onboard-company.dto';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { UserProfile } from 'src/users/entities/user-profile.entity';


interface PaginatedCompanies {
  data: CompanyDto[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable()
export class CompaniesService {
  constructor(

    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private readonly dataSource: DataSource
  ) { }


  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { name, cnpj } = createCompanyDto;

    const existingByCnpj = await this.companiesRepository.findOne({ where: { cnpj } });
    if (existingByCnpj) {
      throw new ConflictException('O CNPJ informado já está cadastrado para outra empresa.');
    }

    const existingByName = await this.companiesRepository.findOne({ where: { name } });
    if (existingByName) {
      throw new ConflictException('Já existe uma empresa cadastrada com este nome.');
    }

    const newCompany = this.companiesRepository.create(createCompanyDto);
    return await this.companiesRepository.save(newCompany);
  }

  async findAll(queryDto: CompanyQueryDto): Promise<PaginatedCompanies> {

    const { page = '1', limit = '10', name, cnpj } = queryDto;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const skip = (parsedPage - 1) * parsedLimit;

    const where: any = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }

    if (cnpj) {
      where.cnpj = Like(`%${cnpj}%`);
    }

    const [companies, total] = await this.companiesRepository.findAndCount({
      where: where, 
      order: { name: 'ASC' }, 
      take: parsedLimit, 
      skip: skip,
    });

    if (total === 0) {
      throw new NotFoundException('Nenhuma empresa foi cadastrada.');
    }

    const lastPage = Math.ceil(total / parsedLimit);

    return {
      data: companies.map((company) => new CompanyDto(company)),
      total: total,
      page: parsedPage,
      lastPage: lastPage,
    };
  }
  async findOne(id: string): Promise<CompanyDto> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Empresa com ID '${id}' não encontrada.`);
    }

    return new CompanyDto(company);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyDto> {

    const existingCompany = await this.companiesRepository.findOne({ where: { id } });

    if (!existingCompany) {
      throw new NotFoundException(`Empresa com ID '${id}' não encontrada para atualização.`);
    }

    const { name, cnpj } = updateCompanyDto;

    if (cnpj && cnpj !== existingCompany.cnpj) {
      const existingByCnpj = await this.companiesRepository.findOne({ where: { cnpj } });
      if (existingByCnpj) {
        throw new ConflictException('O novo CNPJ informado já está cadastrado por outra empresa.');
      }
    }

    if (name && name !== existingCompany.name) {
      const existingByName = await this.companiesRepository.findOne({ where: { name } });
      if (existingByName) {
        throw new ConflictException('O novo nome de empresa já está em uso.');
      }
    }

    const mergedCompany = this.companiesRepository.merge(existingCompany, updateCompanyDto);

    const updatedCompany = await this.companiesRepository.save(mergedCompany);

    return new CompanyDto(updatedCompany);
  }

  async remove(id: string): Promise<{ message: string }> {

    const result = await this.companiesRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Empresa não encontrada para exclusão.`);
    }
    return { message: `Empresa removida com sucesso.` };
  }

  async onboard(dto: OnboardCompanyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.cnpj) {
        const clash = await queryRunner.manager.findOne(Company, { where: { cnpj: dto.cnpj } });
        if (clash) throw new ConflictException('CNPJ já cadastrado.');
      }
      const company = queryRunner.manager.create(Company, {
        name: dto.name,
        cnpj: dto.cnpj || null,
        is_active: true,
      });
      await queryRunner.manager.save(company);

      let adminRole = await queryRunner.manager.findOne(Role, { where: { name: 'Admin' } });
      if (!adminRole) {
        adminRole = queryRunner.manager.create(Role, {
          name: 'Admin',
          description: 'Acesso total ao workspace da empresa',
          is_active: true,
        });
        await queryRunner.manager.save(adminRole);
      }
      const emailClash = await queryRunner.manager.findOne(User, { where: { email: dto.email } });
      if (emailClash) throw new ConflictException('E-mail já utilizado.');

      const encrypted_password = await bcrypt.hash(dto.password, 10);
      const user = queryRunner.manager.create(User, {
        email: dto.email,
        encrypted_password: encrypted_password,
        company: company,
        role: adminRole,
        is_active: true,
      });
      await queryRunner.manager.save(user);

      const profile = queryRunner.manager.create(UserProfile, {
        user,
        full_name: dto.full_name,
        phone: dto.phone || null,
      });
      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();

      return {
        company: { id: company.id, name: company.name, cnpj: company.cnpj },
        admin_user: { id: user.id, email: user.email, role: adminRole.name },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err?.status) throw err;
      throw new InternalServerErrorException('Falha no onboarding.');
    } finally {
      await queryRunner.release();
    }
  }
}
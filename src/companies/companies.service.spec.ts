import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, Like } from 'typeorm'; // Importar Like para simular o filtro
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CompanyDto } from './dto/company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const mockCompanyRepository = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
});

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: MockRepository<Company>;

  const MOCK_CREATE_DTO = { name: 'Empresa Teste', cnpj: '12345678901234', nameFantasy: 'ET' };
  const MOCK_COMPANY_ENTITY = { id: 'uuid-1', ...MOCK_CREATE_DTO } as Company;
  const MOCK_QUERY_DTO: CompanyQueryDto = { page: '1', limit: '10' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository(),
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get<MockRepository<Company>>(getRepositoryToken(Company));
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e retornar uma nova empresa', async () => {
      repository.findOne.mockResolvedValue(null); // Sem duplicidade
      repository.create.mockReturnValue(MOCK_COMPANY_ENTITY);
      repository.save.mockResolvedValue(MOCK_COMPANY_ENTITY);

      const result = await service.create(MOCK_CREATE_DTO);
      
      expect(repository.findOne).toHaveBeenCalledTimes(2); // Verifica CNPJ e Nome
      expect(repository.save).toHaveBeenCalledWith(MOCK_COMPANY_ENTITY);
      expect(result).toEqual(MOCK_COMPANY_ENTITY);
    });

    it('deve lançar ConflictException se o CNPJ já existir', async () => {
      repository.findOne.mockResolvedValueOnce({ id: 'existing-id' }); // Simula CNPJ existente
      
      await expect(service.create(MOCK_CREATE_DTO)).rejects.toThrow(ConflictException);
      await expect(service.create(MOCK_CREATE_DTO)).rejects.toThrow('O CNPJ informado já está cadastrado para outra empresa.');
    });

    it('deve lançar ConflictException se o Nome já existir', async () => {
      repository.findOne.mockResolvedValueOnce(null); // CNPJ livre
      repository.findOne.mockResolvedValueOnce({ id: 'existing-id' }); // Nome existente
      
      await expect(service.create(MOCK_CREATE_DTO)).rejects.toThrow(ConflictException);
      await expect(service.create(MOCK_CREATE_DTO)).rejects.toThrow('Já existe uma empresa cadastrada com este nome.');
    });
  });

  describe('findAll', () => {
    const companyArray = [MOCK_COMPANY_ENTITY];
    const paginatedResult = {
      data: companyArray.map(c => new CompanyDto(c)),
      total: 1,
      page: 1,
      lastPage: 1,
    };

    it('deve retornar a lista paginada de empresas (sucesso)', async () => {
      repository.findAndCount.mockResolvedValue([companyArray, 1]);
      
      const result = await service.findAll(MOCK_QUERY_DTO);
      
      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result).toMatchObject({ total: 1, page: 1 });
    });

    it('deve lançar NotFoundException quando nenhuma empresa for encontrada', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]); // Lista vazia
      
      await expect(service.findAll(MOCK_QUERY_DTO)).rejects.toThrow(NotFoundException);
      await expect(service.findAll(MOCK_QUERY_DTO)).rejects.toThrow('Nenhuma empresa foi cadastrada.');
    });

    it('deve aplicar filtros de nome e cnpj corretamente', async () => {
      const query: CompanyQueryDto = { name: 'Test', cnpj: '123' };
      repository.findAndCount.mockResolvedValue([companyArray, 1]);

      await service.findAll(query);

      // Verifica se o findAndCount foi chamado com as condições WHERE esperadas
      expect(repository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: { 
          name: Like('%Test%'),
          cnpj: Like('%123%'),
        },
      }));
    });
  });

  describe('findOne', () => {
    it('deve retornar uma empresa válida mapeada para CompanyDto', async () => {
      repository.findOne.mockResolvedValue(MOCK_COMPANY_ENTITY);
      
      const result = await service.findOne('uuid-1');
      
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toBeInstanceOf(CompanyDto);
      expect(result.id).toBe('uuid-1');
    });

    it('deve lançar NotFoundException quando o ID não for encontrado', async () => {
      repository.findOne.mockResolvedValue(null);
      
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('invalid-id')).rejects.toThrow("Empresa com ID 'invalid-id' não encontrada.");
    });
  });
  

  describe('update', () => {
    const updateDto: UpdateCompanyDto = { nameFantasy: 'New Fantasy Name' };
    const updatedEntity = { ...MOCK_COMPANY_ENTITY, nameFantasy: 'New Fantasy Name' } as Company;

    it('deve atualizar o nome fantasia e retornar o DTO', async () => {
      repository.findOne.mockResolvedValue(MOCK_COMPANY_ENTITY); // Empresa alvo existe
      repository.merge.mockReturnValue(updatedEntity);
      repository.save.mockResolvedValue(updatedEntity);

      const result = await service.update('uuid-1', updateDto);
      
      expect(repository.save).toHaveBeenCalledWith(updatedEntity);
      expect(result.nameFantasy).toBe('New Fantasy Name');
      expect(result).toBeInstanceOf(CompanyDto);
    });

    it('deve lançar NotFoundException se a empresa não existir', async () => {
      repository.findOne.mockResolvedValue(null);
      
      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });
    
    it('deve lançar ConflictException se o novo CNPJ já existir', async () => {
      const otherCompany = { id: 'uuid-2', cnpj: '99999999999999' };
      const dto: UpdateCompanyDto = { cnpj: otherCompany.cnpj };

      repository.findOne.mockResolvedValueOnce(MOCK_COMPANY_ENTITY); // Empresa alvo existe
      repository.findOne.mockResolvedValueOnce(otherCompany); // Simula CNPJ em uso

      await expect(service.update('uuid-1', dto)).rejects.toThrow(ConflictException);
      await expect(service.update('uuid-1', dto)).rejects.toThrow('O novo CNPJ informado já está cadastrado por outra empresa.');
    });
    
    it('deve lançar ConflictException se o novo Nome já existir', async () => {
      const otherCompany = { id: 'uuid-2', name: 'Other Name' };
      const dto: UpdateCompanyDto = { name: otherCompany.name };

      repository.findOne.mockResolvedValueOnce(MOCK_COMPANY_ENTITY); // Empresa alvo existe
      repository.findOne.mockResolvedValueOnce(null); // CNPJ livre
      repository.findOne.mockResolvedValueOnce(otherCompany); // Simula Nome em uso
      
      await expect(service.update('uuid-1', dto)).rejects.toThrow(ConflictException);
      await expect(service.update('uuid-1', dto)).rejects.toThrow('O novo nome de empresa já está em uso.');
    });
  });
});
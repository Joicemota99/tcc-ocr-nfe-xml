import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';
import { Company } from 'src/companies/entities/company.entity';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>, // Adicionado para validação de FK
    @InjectRepository(Role)
    private roleRepository: Repository<Role> // Adicionado para validação de FK
  ) { }

  // NOVO MÉTODO: Lógica para achar um telefone específico no perfil
  async findByPhone(phone: string): Promise<UserProfile | null> {
    if (!phone) return null;
    return this.userProfileRepository.findOne({ where: { phone } });
  }

  // Lógica para achar um e-mail especifico
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Logica para achar um usuário pelo id e carregar relações (usado na JWT Strategy)
  async findOneById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { id: id },
      // Carrega as relações necessárias para o RolesGuard funcionar
      relations: { role: true, company: true },
    });
  }

  // logica para validar senha
  async validatePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  // Lógica para criar um novo usuário
  async create(createUserDto: any): Promise<User> {
    // === 1. VALIDAÇÕES DE CONFLITO (FORA DO TRY/CATCH) ===
    // a) Verificar se o email existe no bd
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }
    // b) Lógica para validação do telefone
    if (createUserDto.phone) {
      const existingProfile = await this.findByPhone(createUserDto.phone);
      if (existingProfile) {
        throw new ConflictException('Este número de telefone já está em uso por outro usuário.');
      }
    }

    // 2. CRIPTOGRAFAR A SENHA
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // === 3. TRY/CATCH PARA PERSISTÊNCIA (Salvar no DB) ===
    try {
      // a) Criar o User
      const newUser = this.usersRepository.create({
        email: createUserDto.email,
        encrypted_password: hashedPassword,
        companyId: createUserDto.companyId,
        roleId: createUserDto.roleId
      });

      // SALVA O USER
      const savedUser = await this.usersRepository.save(newUser);

      // b) Criar e salvar o PROFILE com o user_id
      const userProfile = this.userProfileRepository.create({
        user_id: savedUser.id,
        full_name: createUserDto.full_name,
        phone: createUserDto.phone || null,
        is_active: true,
      });
      await this.userProfileRepository.save(userProfile);

      // c) Retorna o usuário completo
      return await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ['profile', 'company', 'role'], // Adicionar relações para o retorno
      });

    } catch (error) {
      // 4. TRATAMENTO DE ERRO DE BANCO DE DADOS (FK e Outros)
      if (error.code === '23503') { // Código de erro FK Violation (PostgreSQL)
        throw new NotFoundException('ID de Empresa ou Cargo fornecido não é válido ou não existe.');
      }
      // Erros não tratados/inesperados
      throw new InternalServerErrorException('Erro interno ao salvar novo usuário.');
    }
  }

  async update(user_Id: string, updateUserDto: any): Promise<UserProfile> {
    try {
      // 1. Buscar o User (Se falhar, lança exceção)
      const user = await this.usersRepository.findOne({
        where: { id: user_Id },
      });
      if (!user) {
        throw new NotFoundException(`Usuário ${user_Id} não encontrado`);
      }

      // 2. Buscar o Profile (Se falhar, lança exceção)
      const profile = await this.userProfileRepository.findOne({
        where: { user_id: user_Id },
      });
      if (!profile) {
        throw new NotFoundException(`Usuário ${user_Id} não encontrado`);
      }

      // 3. ATUALIZAÇÃO DA SENHA E FKs (Persistência no DB)
      if (updateUserDto.password) {
        const saltRounds = 12;
        user.encrypted_password = await bcrypt.hash(updateUserDto.password, saltRounds);
        await this.usersRepository.save(user);
      }
      if (updateUserDto.companyId !== undefined) {
        user.companyId = updateUserDto.companyId;
        await this.usersRepository.save(user);
      }
      if (updateUserDto.roleId !== undefined) {
        user.roleId = updateUserDto.roleId;
        await this.usersRepository.save(user);
      }

      // 4. ATUALIZAÇÃO DO PROFILE (Persistência no DB)
      if (updateUserDto.full_name !== undefined) {
        profile.full_name = updateUserDto.full_name;
      }
      if (updateUserDto.phone !== undefined) {
        profile.phone = updateUserDto.phone;
      }
      if (updateUserDto.is_active !== undefined) {
        profile.is_active = updateUserDto.is_active;
      }

      // 5. Retornar o PERFIL atualizado
      return await this.userProfileRepository.save(profile);

    } catch (error) {
      // 6. TRATAMENTO DE ERRO
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23503') {
        throw new NotFoundException('ID de Empresa ou Cargo fornecido não é válido ou não existe.');
      }
      throw new InternalServerErrorException('Erro interno ao atualizar usuário.');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersRepository.find({
        // Carrega as relações para o DTO
        relations: ['company', 'profile', 'role'], // Adicionado 'role'
      });

      // 1. TRATAMENTO DE ERRO DE LÓGICA: Se a lista estiver vazia
      if (!users || users.length === 0) {
        throw new NotFoundException('Nenhum usuário foi cadastrado.');
      }

      // 2. RETORNO E MAPEAMENTO
      return users.map(user => ({
        id: user.id,
        email: user.email,
        companyId: user.companyId, // || null,
        roleId: user.roleId, // || null, // Garante que o roleId é null se a FK for nula
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        company: user.company ? {
                id: user.company.id,
                name: user.company.name,
                nameFantasy: user.company.nameFantasy,
                cnpj: user.company.cnpj,
            } : null,
        profile: user.profile ? {
          id: user.profile.id,
          full_name: user.profile.full_name,
          phone: user.profile.phone,
          is_active: user.profile.is_active,
          created_at: user.profile.created_at,
          updated_at: user.profile.updated_at,
        } : null,
      }));

    } catch (error) {
      // Exceções HTTP são relançadas
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Erros inesperados (DB, rede)
      throw new InternalServerErrorException('Erro interno ao listar usuários.');
    }
  }
}
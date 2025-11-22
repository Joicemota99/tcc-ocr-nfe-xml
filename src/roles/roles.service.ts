import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      throw new ConflictException('Cargo com esse nome já criado, confira sua lista de cargos.');
    }

    const newRole = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(newRole);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.rolesRepository.find({
      order: { name: 'ASC' }
    });
    if (!roles || roles.length === 0) {
      throw new NotFoundException('Nenhum cargo foi criado.');
    }

    return roles;
  }
  
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {

      const existingRole = await this.rolesRepository.findOne({
        where: { id }
      });

      if (!existingRole) {
        throw new NotFoundException('Cargo não encontrado');
      }
      
      if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
        const roleWithSameName = await this.rolesRepository.findOne({
          where: { name: updateRoleDto.name }
        });

        if (roleWithSameName) {
          throw new ConflictException('Cargo com esse nome já criado, confira sua lista de cargos.');
        }
      }
        
      if (updateRoleDto.name !== undefined) {
        existingRole.name = updateRoleDto.name;
      }

      if (updateRoleDto.description !== undefined) {
        existingRole.description = updateRoleDto.description;
      }

      const updatedRole = await this.rolesRepository.save(existingRole);
      
      console.log('✅ Cargo atualizado com sucesso:', updatedRole.id);
      return updatedRole;
    } catch (error) {
      console.error('❌ Erro ao atualizar cargo:', error);

      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Erro interno ao atualizar cargo');
    }
  }
}
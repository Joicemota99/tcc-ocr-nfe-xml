// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Importe a Entity
import { UserProfile } from './entities/user-profile.entity'; // ← Importar a entity
import { UsersService } from './users.service'; // Já deve estar aqui
import { UsersController } from './users.controller';
import { Company } from 'src/companies/entities/company.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  // Importe o TypeOrmModule e forneça a lista de entities deste módulo
  imports: [TypeOrmModule.forFeature([User, UserProfile, Company, Role])],
  // Torne o UsersService disponível para outros módulos que importarem este
  providers: [UsersService],
  // Exporte o TypeOrmModule (com a entity User) e o UsersService
  // para que possam ser usados por outros módulos (ex: o módulo de Auth)
  exports: [TypeOrmModule, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Put, Param, Res, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Response } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async create(@Body() createRoleDto: CreateRoleDto): Promise<{ message: string; role: Role }> {
    const role = await this.rolesService.create(createRoleDto);
    return {
      message: 'Cargo criado com sucesso',
      role: role
    };
  }

  @Get()
  @Roles('Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{ message: string; roles: Role[] }> {
    const roles = await this.rolesService.findAll();
    return {
      message: 'Cargos encontrados com sucesso',
      roles: roles
    };
  }

  @Put(':id')
  @Roles('Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string, 
    @Body() updateRoleDto: UpdateRoleDto, 
    @Res() res: Response
  ): Promise<Response> {
    try {
      const role = await this.rolesService.update(id, updateRoleDto);
      return res.status(HttpStatus.OK).json({
        message: 'Cargo atualizado com sucesso',
        role: role
      });
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({
        message: 'Erro interno do servidor'
      });
    }
  }
}
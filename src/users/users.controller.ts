// src/users/users.controller.ts
import { Controller, Post, Body, Res, Put, Param, Get, ValidationPipe, UsePipes, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
@UsePipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true
}))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Res() res: Response) {
    try {
      const users = await this.usersService.findAll();
      return res.status(200).json({
        message: 'Usuários encontrados com sucesso',
        count: users.length,
        data: users,
      })
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'Erro interno do servidor',
      });
    }

  }
  @Post()
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto);
      const { encrypted_password, ...result } = user;
      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: result,
      });
    } catch (error) {
      // ⚠️ IMPORTANTE: Tratar o erro!
      return res.status(error.status || 500).json({
        message: error.message || 'Erro interno do servidor',
      });
    }
  }

  @Put(':id')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    try {
      const userUpdate = await this.usersService.update(id, updateUserDto);
      return res.status(200).json({
        message: 'Informações atualizadas!',
        userUpdate
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message || 'Erro interno do servidor',
      });
    }
  }

}


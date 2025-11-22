import { Controller, Get, Post, Body, Param, Query, Patch, Put, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CompaniesSuppliersService } from './companies-suppliers.service';
import { CreateCompanySupplierDto } from './dto/create-companies-supplier.dto';
import { UpdateCompanySupplierDto } from './dto/update-companies-supplier.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';


@Controller('companies-suppliers')
export class CompaniesSuppliersController {
  constructor(private readonly service: CompaniesSuppliersService) { }

  //Criar fornecedor
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  create(@Body() dto: CreateCompanySupplierDto) {
    return this.service.create(dto);
  }

  //Listar todos os fornecedores
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findAll(
    @Query('companyId') companyId: string,
    @Query('is_active') isActive?: string,
    @Query('q') q?: string,
  ) {
    return this.service.findAll(companyId, isActive === undefined ? undefined : isActive === 'true', q);
  }

  //Listar fornecedores pelo Id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }


  // Atualizar o Id do fornecedor
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  update(@Param('id') id: string, @Body() dto: UpdateCompanySupplierDto) {
    return this.service.update(id, dto);
  }

  //Ativar ou desativar fornecedor
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  setStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
    return this.service.setStatus(id, is_active);
  }

  //Rota para vincular fornecedor/empresa
  @Patch(':id/link-company')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  linkCompany(
    @Param('id') supplierId: string,
    @Body('companyId') companyId: string,
  ) {
    return this.service.linkSupplierToCompany(supplierId, companyId);
  }

  //rota para consultar
  @Get(':id/company')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  getCompany(@Param('id') id: string) {
    return this.service.getCompanyBySupplierId(id);
  }


}

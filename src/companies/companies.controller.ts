import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyDto } from './dto/company.dto';
import { Company } from './entities/company.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CompanyQueryDto } from './dto/company-query.dto';
import { PaginatedCompanies } from './dto/paginated-companies.interface';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { OnboardCompanyDto } from './dto/onboard-company.dto';

@Controller('companies')
@UsePipes(new ValidationPipe({ transform: true }))
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  // Criar empresa
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  //Listar empresas
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')

  async findAll(
    @Query() queryDto: CompanyQueryDto,
  ): Promise<PaginatedCompanies> {
    return this.companiesService.findAll(queryDto);
  }

  // Procurar uma empresa especifica
  @Get(':id')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<CompanyDto> {
    return this.companiesService.findOne(id);
  }

  //Atualizar empresa
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  //Deletar empresa
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async remove(@Param('id') id: string): Promise<any> {
    return this.companiesService.remove(id);
  }

  //Onboard da primeira empresa
  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async onboard(@Body() dto: OnboardCompanyDto) {
    return this.companiesService.onboard(dto);
  }
}
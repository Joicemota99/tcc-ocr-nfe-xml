import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Put,
    Patch,
    HttpCode,
    HttpStatus,
    UseGuards
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth-guard';


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }
    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    findAll(
        @Query('companySupplierId') companySupplierId?: string,
        @Query('is_active') isActiveStr?: string,
        @Query('q') q?: string,
    ) {
        const isActive =
            isActiveStr === undefined ? undefined : isActiveStr === 'true';

        return this.productsService.findAll(companySupplierId, isActive, q);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

   
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Patch(':id/deactivate')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    deactivate(@Param('id') id: string) {
        return this.productsService.deactivate(id);
    }

    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.productsService.activate(id);
    }

}

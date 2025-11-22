import {
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CompanySupplier } from '../companies-suppliers/entities/company-supplier.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepo: Repository<Product>,

        @InjectRepository(CompanySupplier)
        private readonly suppliersRepo: Repository<CompanySupplier>,
    ) { }
    async create(dto: CreateProductDto) {
        try {
            const supplier = await this.suppliersRepo.findOne({
                where: { id: dto.companySupplierId },
            });

            if (!supplier) {
                throw new BadRequestException('Fornecedor (companySupplierId) não encontrado');
            }

            const product = this.productsRepo.create({
                company_supplier: supplier,
                name: dto.name,
                description: dto.description,
                barcode: dto.barcode,
                unit_of_measure: dto.unit_of_measure,
                coast_price: dto.coast_price,
                sale_price_suggested: dto.sale_price_suggested,
                current_stock_quantity: dto.current_stock_quantity ?? 0,
                is_active: dto.is_active ?? true,
            });

            return await this.productsRepo.save(product);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('Erro interno ao criar produto');
        }
    }

    async findAll(
        companySupplierId?: string,
        isActive?: boolean,
        q?: string,
    ) {
        try {
            const qb = this.productsRepo
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.company_supplier', 's');

            if (companySupplierId) {
                qb.where('s.id = :supplierId', { supplierId: companySupplierId });
            }

            if (typeof isActive === 'boolean') {
                qb.andWhere('p.is_active = :isActive', { isActive });
            }

            if (q) {
                qb.andWhere(
                    '(p.name ILIKE :q OR p.description ILIKE :q OR p.barcode ILIKE :q)',
                    { q: `%${q}%` },
                );
            }

            return await qb.orderBy('p.name', 'ASC').getMany();
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            throw new InternalServerErrorException('Erro interno ao buscar produtos');
        }
    }

    async findOne(id: string) {
        try {
            const product = await this.productsRepo.findOne({
                where: { id },
                relations: ['company_supplier'],
            });

            if (!product) {
                throw new NotFoundException('Produto não encontrado');
            }

            return product;
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Erro interno ao buscar produto');
        }
    }

    async update(id: string, dto: UpdateProductDto) {
        try {
            const product = await this.findOne(id);

            if (dto.companySupplierId) {
                const newSupplier = await this.suppliersRepo.findOne({
                    where: { id: dto.companySupplierId },
                });
                if (!newSupplier) {
                    throw new BadRequestException('Novo fornecedor (companySupplierId) não encontrado');
                }
                product.company_supplier = newSupplier;
            }

            Object.assign(product, {
                name: dto.name ?? product.name,
                description: dto.description ?? product.description,
                barcode: dto.barcode ?? product.barcode,
                unit_of_measure: dto.unit_of_measure ?? product.unit_of_measure,
                coast_price: dto.coast_price ?? product.coast_price,
                sale_price_suggested:
                    dto.sale_price_suggested ?? product.sale_price_suggested,
                current_stock_quantity:
                    dto.current_stock_quantity ?? product.current_stock_quantity,
                is_active: dto.is_active ?? product.is_active,
            });

            return await this.productsRepo.save(product);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro interno ao atualizar produto');
        }
    }

    async deactivate(id: string) {
        try {
            const product = await this.findOne(id);

            if (!product.is_active) {
                return product;
            }

            product.is_active = false;
            return await this.productsRepo.save(product);
        } catch (error) {
            console.error('Erro ao desativar produto:', error);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Erro interno ao desativar produto');
        }
    }
    async activate(id: string) {
        try {
            const product = await this.findOne(id);

            if (product.is_active) {
                return product; // já está ativo
            }

            product.is_active = true;
            return await this.productsRepo.save(product);
        } catch (error) {
            console.error('Erro ao ativar produto:', error);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Erro interno ao ativar produto');
        }
    }

}

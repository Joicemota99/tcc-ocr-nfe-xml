import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Company } from '../companies/entities/company.entity';
import { CompanySupplier } from '../companies-suppliers/entities/company-supplier.entity';
import { Product } from '../products/entities/product.entity';

import { CreateInvoiceFromOcrDto } from './dto/create-invoice-from-ocr.dto';

import * as Tesseract from 'tesseract.js';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepo: Repository<Invoice>,

    @InjectRepository(InvoiceItem)
    private readonly itemsRepo: Repository<InvoiceItem>,

    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,

    @InjectRepository(CompanySupplier)
    private readonly suppliersRepo: Repository<CompanySupplier>,

    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  // ===========================================================
  // 1) CRIA NOTA FISCAL VIA DTO (OCR ou XML já tratados)
  // ===========================================================
  async createFromOcr(companyId: string, dto: CreateInvoiceFromOcrDto) {
    try {
      // 1) Validar empresa
      const company = await this.companiesRepo.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new BadRequestException('Empresa (companyId) não encontrada');
      }

      // 2) Validar/garantir fornecedor
      const { cnpj, name, name_fantasy } = dto.supplier;

      let supplier = await this.suppliersRepo.findOne({
        where: { company: { id: company.id }, cnpj },
        relations: ['company'],
      });

      if (!supplier) {
        supplier = this.suppliersRepo.create({
          company,
          cnpj,
          name,
          name_fantasy,
          is_active: true,
        });
        supplier = await this.suppliersRepo.save(supplier);
      }

      // 3) Criar itens e produtos
      const invoiceItems: InvoiceItem[] = [];

      for (const itemDto of dto.items) {
        let product: Product | null = null;

        // Buscar por barcode primeiro
        if (itemDto.barcode) {
          product = await this.productsRepo.findOne({
            where: {
              company_supplier: { id: supplier.id },
              barcode: itemDto.barcode,
            },
            relations: ['company_supplier'],
          });
        }
        if (!product) {
          product = await this.productsRepo.findOne({
            where: {
              company_supplier: { id: supplier.id },
              name: itemDto.product_name,
            },
            relations: ['company_supplier'],
          });
        }

        if (!product) {
          product = this.productsRepo.create({
            company_supplier: supplier,
            name: itemDto.product_name,
            description: itemDto.description,
            barcode: itemDto.barcode,
            unit_of_measure: itemDto.unit_of_measure,
            coast_price: itemDto.unit_price,
            sale_price_suggested: null,
            current_stock_quantity: itemDto.quantity,
            is_active: true,
          });
        } else {
          product.coast_price = itemDto.unit_price;
          product.current_stock_quantity =
            (product.current_stock_quantity || 0) + itemDto.quantity;
        }

        product = await this.productsRepo.save(product);

        // 3.2 Criar item da nota
        const invoiceItem = this.itemsRepo.create({
          product,
          description: itemDto.description,
          quantity: itemDto.quantity,
          unit_price: itemDto.unit_price,
          total_price: itemDto.total_price,
          unit_of_measure: itemDto.unit_of_measure,
          barcode: itemDto.barcode,
        });

        invoiceItems.push(invoiceItem);
      }

      // 4) Criar a nota fiscal (Invoice)
      const invoice = this.invoicesRepo.create({
        company,
        supplier,
        invoice_number: dto.invoice_number,
        series: dto.series,
        issue_date: dto.issue_date ? new Date(dto.issue_date) : null,
        total_amount: dto.total_amount,
        items: invoiceItems,
      });

      const saved = await this.invoicesRepo.save(invoice);

      return this.invoicesRepo.findOne({
        where: { id: saved.id },
        relations: ['company', 'supplier', 'items', 'items.product'],
      });
    } catch (error) {
      console.error('Erro ao criar nota a partir do DTO (OCR/XML):', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro interno ao processar nota fiscal',
      );
    }
  }
  async createFromXml(companyId: string, xml: string) {
    try {
      // 1) Converter XML da NF-e em DTO padrão
      const dto = await this.parseNfeXmlToDto(xml);

      // 2) Reaproveitar a mesma lógica de criação
      return this.createFromOcr(companyId, dto);
    } catch (error) {
      console.error('Erro ao processar XML da NF-e:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao processar XML da nota fiscal',
      );
    }
  }

  async createFromOcrImage(companyId: string, imagePath: string) {
    try {
      const { data } = await Tesseract.recognize(imagePath, 'por+eng', {
        logger: (m) => console.log('TESSERACT:', m),
      });

      const rawText = data.text;
      console.log('Texto OCR extraído:\n', rawText);

      const dto = this.parseOcrTextToDto(rawText);
      return this.createFromOcr(companyId, dto);
    } catch (error) {
      console.error('Erro no OCR da imagem:', error);
      throw new InternalServerErrorException(
        'Erro ao processar imagem da nota fiscal via OCR',
      );
    }
  }

  private parseOcrTextToDto(rawText: string): CreateInvoiceFromOcrDto {
    const clean = rawText.replace(/\s+/g, ' ').trim();

    const cnpjMatch = clean.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
    const supplierCnpj = cnpjMatch ? cnpjMatch[0] : '00.000.000/0000-00';

    let supplierName = 'Fornecedor OCR';
    if (cnpjMatch) {
      const idx = clean.indexOf(cnpjMatch[0]);
      supplierName = clean.substring(idx - 60, idx).trim();
    }

    const numMatch = clean.match(/(\d{5,10})\s+Consulta/);
    const invoice_number = numMatch ? numMatch[1] : '000000';

    const totalMatch = clean.match(/(\d+,\d{2})\s*->/);
    const total_amount = totalMatch
      ? Number(totalMatch[1].replace(/\./g, '').replace(',', '.'))
      : 0;

    const itemRegex =
      /(\d{3,5})\s*\|?\s*(\d+)\s+(.+?)\s+(UN|DP)\s+(\d+)\s+(\d+,\d+)\s+(\d+,\d+)\s+(\d+,\d+)\s+(\d+,\d+)/g;

    let match;
    const items: any[] = [];

    while ((match = itemRegex.exec(clean)) !== null) {
      items.push({
        product_name: match[3].trim(),
        description: match[3].trim(),
        unit_of_measure: match[4],
        quantity: Number(match[2]),
        unit_price: Number(
          match[6].replace(/\./g, '').replace(',', '.'),
        ),
        total_price: Number(
          match[7].replace(/\./g, '').replace(',', '.'),
        ),
      });
    }

    if (items.length === 0) {
      items.push({
        product_name: 'ITEM OCR - NÃO RECONHECIDO',
        description: 'Item não identificado pelo OCR',
        unit_of_measure: 'UN',
        quantity: 1,
        unit_price: total_amount,
        total_price: total_amount,
      });
    }

    return {
      supplier: {
        name: supplierName,
        name_fantasy: supplierName,
        cnpj: supplierCnpj,
      },
      invoice_number,
      series: '1',
      issue_date: undefined,
      total_amount,
      items,
    };
  }

  private async parseNfeXmlToDto(
    xml: string,
  ): Promise<CreateInvoiceFromOcrDto> {
    const parsed = await parseStringPromise(xml, {
      explicitArray: true,
      trim: true,
    });

    const nfe =
      parsed.nfeProc?.NFe?.[0] ??
      parsed.NFe?.[0] ??
      parsed.nfe?.[0] ??
      parsed.nfeProc?.nfe?.[0];

    if (!nfe) {
      throw new BadRequestException('XML da NF-e em formato inesperado.');
    }

    const infNFe = nfe.infNFe?.[0];
    if (!infNFe) {
      throw new BadRequestException(
        'Não foi possível localizar infNFe no XML.',
      );
    }

    const ide = infNFe.ide?.[0] ?? {};
    const emit = infNFe.emit?.[0] ?? {};
    const total = infNFe.total?.[0]?.ICMSTot?.[0] ?? {};
    const detList = infNFe.det ?? [];

    const supplierCnpj = (emit.CNPJ?.[0] ?? '').toString();
    const supplierName = (emit.xNome?.[0] ?? 'Fornecedor XML').toString();
    const supplierFantasy = (
      emit.xFant?.[0] ?? emit.xNome?.[0] ?? 'Fornecedor XML'
    ).toString();


    const invoice_number = (ide.nNF?.[0] ?? '0').toString();
    const series = (ide.serie?.[0] ?? '1').toString();
    const issue_date = (ide.dhEmi?.[0] ?? ide.dEmi?.[0] ?? undefined) as
      | string
      | undefined;

    const totalStr = (total.vNF?.[0] ?? '0').toString();
    const total_amount = Number(totalStr.replace(',', '.'));

    const items: {
      product_name: string;
      description?: string;
      barcode?: string;
      unit_of_measure?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[] = [];

    for (const det of detList) {
      const prod = det.prod?.[0];
      if (!prod) continue;

      const name = (prod.xProd?.[0] ?? 'ITEM SEM NOME').toString();
      const ean = (prod.cEAN?.[0] ?? '').toString();
      const unit = (prod.uCom?.[0] ?? 'UN').toString();
      const qCom = (prod.qCom?.[0] ?? '0').toString();
      const vUnCom = (prod.vUnCom?.[0] ?? '0').toString();
      const vProd = (prod.vProd?.[0] ?? '0').toString();

      items.push({
        product_name: name,
        description: name,
        barcode: ean === 'SEM GTIN' ? undefined : ean,
        unit_of_measure: unit,
        quantity: Number(qCom.replace(',', '.')),
        unit_price: Number(vUnCom.replace(',', '.')),
        total_price: Number(vProd.replace(',', '.')),
      });
    }

    if (items.length === 0) {
      throw new BadRequestException(
        'Nenhum item encontrado no XML da NF-e.',
      );
    }

    return {
      supplier: {
        name: supplierName,
        name_fantasy: supplierFantasy,
        cnpj: supplierCnpj,
      },
      invoice_number,
      series,
      issue_date,
      total_amount,
      items,
    };
  }
}

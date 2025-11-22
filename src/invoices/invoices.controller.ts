import {
  Controller,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceFromOcrDto } from './dto/create-invoice-from-ocr.dto';
import * as fs from 'fs/promises';


@Controller('invoices')
export class InvoicesController {
   constructor(private readonly invoicesService: InvoicesService) {}

  // já existe:
  @Post('company/:companyId/ocr')
  createFromOcrJson(
    @Param('companyId') companyId: string,
    @Body() dto: CreateInvoiceFromOcrDto,
  ) {
    return this.invoicesService.createFromOcr(companyId, dto);
  }

  

 // upload de imagem para leitura OCR
  @Post('company/:companyId/ocr-image')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads/invoices' }))
  async createFromOcrImage(
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Envie um arquivo no campo "file".');
    }
    return this.invoicesService.createFromOcrImage(companyId, file.path);
  }

  @Post('company/:companyId/xml')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads/invoices' }))
  async createFromXmlUpload(
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Envie um arquivo XML no campo "file".');
    }
    const xml = await fs.readFile(file.path, 'utf8');

    return this.invoicesService.createFromXml(companyId, xml);
  }
}



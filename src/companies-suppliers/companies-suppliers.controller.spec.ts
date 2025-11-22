import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesSuppliersController } from './companies-suppliers.controller';
import { CompaniesSuppliersService } from './companies-suppliers.service';

describe('CompaniesSuppliersController', () => {
  let controller: CompaniesSuppliersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesSuppliersController],
      providers: [CompaniesSuppliersService],
    }).compile();

    controller = module.get<CompaniesSuppliersController>(CompaniesSuppliersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

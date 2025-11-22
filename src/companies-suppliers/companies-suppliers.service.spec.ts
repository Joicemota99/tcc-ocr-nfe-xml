import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesSuppliersService } from './companies-suppliers.service';

describe('CompaniesSuppliersService', () => {
  let service: CompaniesSuppliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompaniesSuppliersService],
    }).compile();

    service = module.get<CompaniesSuppliersService>(CompaniesSuppliersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

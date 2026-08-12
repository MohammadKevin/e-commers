import { Test, TestingModule } from '@nestjs/testing';
import { SellerApplicationsService } from './seller-applications.service';

describe('SellerApplicationsService', () => {
  let service: SellerApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerApplicationsService],
    }).compile();

    service = module.get<SellerApplicationsService>(SellerApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

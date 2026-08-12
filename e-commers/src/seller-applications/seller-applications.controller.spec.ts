import { Test, TestingModule } from '@nestjs/testing';
import { SellerApplicationsController } from './seller-applications.controller';

describe('SellerApplicationsController', () => {
  let controller: SellerApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerApplicationsController],
    }).compile();

    controller = module.get<SellerApplicationsController>(SellerApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

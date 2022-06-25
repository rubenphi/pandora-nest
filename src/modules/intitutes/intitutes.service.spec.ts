import { Test, TestingModule } from '@nestjs/testing';
import { IntitutesService } from './intitutes.service';

describe('IntitutesService', () => {
  let service: IntitutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntitutesService],
    }).compile();

    service = module.get<IntitutesService>(IntitutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

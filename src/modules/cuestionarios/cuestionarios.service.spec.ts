import { Test, TestingModule } from '@nestjs/testing';
import { CuestionariosService } from './cuestionarios.service';

describe('CuestionariosService', () => {
  let service: CuestionariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuestionariosService],
    }).compile();

    service = module.get<CuestionariosService>(CuestionariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

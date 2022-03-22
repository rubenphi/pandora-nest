import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CursosController } from './cursos/cursos.controller';
import { CursosService } from './cursos/cursos.service';

@Module({
  imports: [],
  controllers: [AppController, CursosController],
  providers: [AppService, CursosService],
})
export class AppModule {}

import { Module } from '@nestjs/common';

import { CursosModule } from './modules/cursos/cursos.module';

@Module({
	imports: [CursosModule],
})
export class AppModule {}

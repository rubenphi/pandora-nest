import { Module } from '@nestjs/common';
import { IntitutesService } from './intitutes.service';

@Module({
  providers: [IntitutesService]
})
export class IntitutesModule {}

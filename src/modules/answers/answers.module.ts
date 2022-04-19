import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { Answer } from './answer.entity';
import { Option } from 'src/modules/options/option.entity';

@Module({	
    imports: [TypeOrmModule.forFeature([Answer, Option])],
	providers: [AnswersService],
	controllers: [AnswersController],})
export class AnswersModule {}

import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';
import { Option } from './option.entity';
import { Question } from '../questions/question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionsController } from './options.controller';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Option, Question, Institute])],
	providers: [OptionsService],
	controllers: [OptionsController],
})
export class OptionsModule {}

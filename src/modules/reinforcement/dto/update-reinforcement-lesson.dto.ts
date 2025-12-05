import { PartialType } from '@nestjs/swagger';
import { CreateReinforcementLessonDto } from './create-reinforcement-lesson.dto';

export class UpdateReinforcementLessonDto extends PartialType(CreateReinforcementLessonDto) {}

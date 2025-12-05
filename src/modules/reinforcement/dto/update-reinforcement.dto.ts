import { PartialType } from '@nestjs/swagger';
import { CreateReinforcementDto } from './create-reinforcement.dto';

export class UpdateReinforcementDto extends PartialType(CreateReinforcementDto) {}

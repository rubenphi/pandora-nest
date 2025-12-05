import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { ReinforcementService } from './reinforcement.service';
import {
	CreateReinforcementDto,
	UpdateReinforcementDto,
	CreateReinforcementLessonDto,
	UpdateReinforcementLessonDto,
} from './dto';

@Controller('reinforcement')
export class ReinforcementController {
	constructor(private readonly reinforcementService: ReinforcementService) {}

	@Post()
	create(@Body() createReinforcementDto: CreateReinforcementDto) {
		return this.reinforcementService.create(createReinforcementDto);
	}

	@Get()
	findAll() {
		return this.reinforcementService.findAll();
	}

	@Post('lesson')
	createLesson(
		@Body() createReinforcementLessonDto: CreateReinforcementLessonDto,
	) {
		return this.reinforcementService.createReinforcementLesson(
			createReinforcementLessonDto,
		);
	}

	@Get('lesson/:lessonId')
	getReinforcementsByLesson(@Param('lessonId') lessonId: string) {
		return this.reinforcementService.getReinforcementsByLesson(+lessonId);
	}

	@Patch('lesson/:id')
	updateLesson(
		@Param('id') id: string,
		@Body() updateReinforcementLessonDto: UpdateReinforcementLessonDto,
	) {
		return this.reinforcementService.updateReinforcementLesson(
			+id,
			updateReinforcementLessonDto,
		);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.reinforcementService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateReinforcementDto: UpdateReinforcementDto,
	) {
		return this.reinforcementService.update(+id, updateReinforcementDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.reinforcementService.remove(+id);
	}
}

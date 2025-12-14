import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsObject } from 'class-validator';

import { Group } from 'src/modules/groups/group.entity';

export class ResultLessonDto {
	@IsObject()
	readonly group: Group;
	@Type(() => Number)
	@IsNumber()
	readonly points: number;
}

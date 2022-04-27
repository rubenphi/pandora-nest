import { IsInt, IsObject } from 'class-validator';

import { Group } from 'src/modules/groups/group.entity';

export class ResultLessonDto {
	@IsObject()
	readonly group: Group;
	@IsInt()
	readonly points: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryAnswerDto {
	@ApiProperty({
		description: 'Search answer using option id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly optionId?: number;
	@ApiProperty({
		description: 'Search answer using question id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly questionId?: number;
	@ApiProperty({
		description: 'Search answer using group id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly groupId?: number;
	@ApiProperty({
		description: 'Search answer using lesson id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId?: number;
	@ApiProperty({
		description: 'Institute id of user',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Search answer if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist: boolean;
}

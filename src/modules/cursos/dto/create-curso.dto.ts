import { IsString, IsBoolean } from 'class-validator';

export class CreateCursoDto {
	@IsString()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}

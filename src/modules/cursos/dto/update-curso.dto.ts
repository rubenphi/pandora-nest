import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateCursoDto {
	@IsNotEmpty()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}

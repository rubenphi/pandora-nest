import { IsNotEmpty } from 'class-validator';

export class UpdateCursoDto {
	@IsNotEmpty()
	readonly name: string;
	readonly exist: boolean;
}

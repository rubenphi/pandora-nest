import { IsString } from 'class-validator';

export class CreateCursoDto {
	@IsString()
	readonly name: string;
}

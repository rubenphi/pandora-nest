import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateGrupoDto {
	@IsString()
	readonly name: string;
	@IsInt()
	readonly curso_id: number;
	@IsBoolean()
	readonly exist: boolean;
}

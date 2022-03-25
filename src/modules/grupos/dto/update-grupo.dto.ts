import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class UpdateGrupoDto {
	@IsNotEmpty()
	readonly name: string;
	@IsInt()
	readonly curso_id: number;
	@IsBoolean()
	readonly exist: boolean;
}

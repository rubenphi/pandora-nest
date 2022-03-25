import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateGrupoDto {
	@IsString()
	readonly name: string;
	@IsInt()
	readonly curso: number;
	@IsBoolean()
	readonly exist: boolean;
}

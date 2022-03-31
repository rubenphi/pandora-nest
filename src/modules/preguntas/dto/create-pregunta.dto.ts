import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreatePreguntaDto {
	@IsString()
	readonly titulo: string;
	@IsString()
	readonly enunciado: string;
	@IsInt()
	readonly valor: number;
	@IsOptional()
	readonly photo?: string;
	@IsBoolean()
	readonly visible: boolean;
	@IsBoolean()
	readonly disponible: boolean;
	@IsInt()
	readonly cuestionario_id: number;
	@IsBoolean()
	readonly exist: boolean;
}

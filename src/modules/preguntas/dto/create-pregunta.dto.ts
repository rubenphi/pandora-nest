import {
	IsNotEmpty,
	IsString,
	IsInt,
	IsBoolean,
	IsOptional,
} from 'class-validator';

export class CreatePreguntaDto {
	@IsString()
	readonly titulo: string;
	@IsString()
	readonly enunciado: string;
	@IsNotEmpty()
	readonly valor: number;
	@IsOptional()
	photo?: string;
	@IsNotEmpty()
	readonly visible: boolean;
	@IsNotEmpty()
	readonly disponible: boolean;
	@IsNotEmpty()
	readonly cuestionario_id: number;
	@IsNotEmpty()
	readonly exist: boolean;
}

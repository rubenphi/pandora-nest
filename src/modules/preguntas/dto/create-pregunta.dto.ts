import { Type } from 'class-transformer';
import {
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
	@Type(() => Number)
	@IsInt()
	readonly valor: number;
	@IsOptional()
	photo?: string;
	@Type(() => Boolean)
	@IsBoolean()
	readonly visible: boolean;
	@Type(() => Boolean)
	@IsBoolean()
	readonly disponible: boolean;
	@Type(() => Number)
	@IsInt()
	readonly cuestionario_id: number;
	@Type(() => Boolean)
	@IsBoolean()
	readonly exist: boolean;
}

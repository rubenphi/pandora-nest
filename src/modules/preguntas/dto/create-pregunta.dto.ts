import { Type, Transform } from 'class-transformer';
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
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly visible: boolean;
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly disponible: boolean;
	@Type(() => Number)
	@IsInt()
	readonly cuestionario_id: number;
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}

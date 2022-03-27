import { IsString, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class CreateCuestionarioDto {
	@IsString()
	readonly theme: string;
	@IsDateString()
	readonly date: Date;
	@IsInt()
	readonly curso_id: number;
	@IsBoolean()
	readonly exist: boolean;
}

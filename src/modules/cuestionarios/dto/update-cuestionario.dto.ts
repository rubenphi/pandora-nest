import { IsString, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class UpdateCuestionarioDto {
	@IsString()
	readonly theme: string;
	@IsDateString()
	readonly date: Date;
	@IsInt()
	readonly curso_id: number;
	@IsBoolean()
	readonly exist: boolean;
}

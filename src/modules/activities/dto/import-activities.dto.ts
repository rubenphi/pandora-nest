import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ImportActivitiesDto {
	@ApiProperty({ description: 'ID de la lección destino' })
	@IsNotEmpty()
	@IsNumber()
	lessonId: number;

	@ApiProperty({
		required: false,
		description: 'ID del instituto destino (opcional)',
	})
	@IsOptional()
	@IsNumber()
	instituteId?: number;

	@ApiProperty({
		type: [Number],
		description:
			'Arreglo de IDs de las actividades que se van a importar/clonar',
	})
	@IsArray()
	@IsNumber({}, { each: true })
	@IsNotEmpty()
	sourceActivityIds: number[];
}

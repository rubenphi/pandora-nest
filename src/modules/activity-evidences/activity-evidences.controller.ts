import {
	Controller,
	Get,
	Post,
	Delete,
	Param,
	Body,
	UseInterceptors,
	UploadedFiles,
	ParseIntPipe,
	BadRequestException,
	HttpStatus,
	Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ActivityEvidencesService } from './activity-evidences.service';
import { Response } from 'express';

@ApiTags('Activity Evidences')
@Controller('activity-evidences')
export class ActivityEvidencesController {
	constructor(private readonly evidencesService: ActivityEvidencesService) {}

	@Post('upload')
	@UseInterceptors(FilesInterceptor('files'))
	async uploadEvidence(
		@UploadedFiles() files: Express.Multer.File[],
		@Body('studentId') studentIdStr: string,
		@Body('activityId') activityIdStr: string,
		@Body('instituteId') instituteIdStr: string,
	) {
		const studentId = parseInt(studentIdStr, 10);
		const activityId = parseInt(activityIdStr, 10);
		const instituteId = parseInt(instituteIdStr, 10);

		if (isNaN(studentId) || isNaN(activityId) || isNaN(instituteId)) {
			throw new BadRequestException('studentId, activityId y instituteId deben ser números válidos.');
		}

		if (!files || files.length === 0) {
			throw new BadRequestException('Se debe subir al menos un archivo.');
		}

		const savedEvidence = await this.evidencesService.processAndSaveEvidence(
			files,
			studentId,
			activityId,
			instituteId,
		);

		return {
			message: 'Evidencia procesada y guardada correctamente en PDF.',
			evidence: savedEvidence,
		};
	}

	@Get('activity/:activityId')
	async getEvidencesByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
		return await this.evidencesService.findByActivity(activityId);
	}

	@Get('activity/:activityId/student/:studentId')
	async getEvidenceByStudentAndActivity(
		@Param('activityId', ParseIntPipe) activityId: number,
		@Param('studentId', ParseIntPipe) studentId: number,
	) {
		const evidence = await this.evidencesService.findByStudentAndActivity(studentId, activityId);
		return evidence || { message: 'Sin evidencia registrada', evidence: null };
	}

	@Delete(':id')
	async deleteEvidence(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		await this.evidencesService.deleteEvidence(id);
		return res.status(HttpStatus.NO_CONTENT).send();
	}
}

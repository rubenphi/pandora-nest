import {
	Controller,
	Get,
	Post,
	Delete,
	Param,
	Query,
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
		@Body('studentId') studentIdStr?: string,
		@Body('studentIds') studentIdsRaw?: any,
		@Body('activityId') activityIdStr?: string,
		@Body('instituteId') instituteIdStr?: string,
	) {
		let studentIds: number[] = [];

		if (studentIdsRaw) {
			if (Array.isArray(studentIdsRaw)) {
				studentIds = studentIdsRaw.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
			} else if (typeof studentIdsRaw === 'string') {
				try {
					const parsed = JSON.parse(studentIdsRaw);
					if (Array.isArray(parsed)) {
						studentIds = parsed.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
					}
				} catch {
					studentIds = studentIdsRaw
						.split(',')
						.map((id) => parseInt(id.trim(), 10))
						.filter((id) => !isNaN(id));
				}
			}
		}

		if (studentIds.length === 0 && studentIdStr) {
			const singleId = parseInt(studentIdStr, 10);
			if (!isNaN(singleId)) {
				studentIds = [singleId];
			}
		}

		const activityId = parseInt(activityIdStr, 10);
		const instituteId = parseInt(instituteIdStr, 10);

		if (studentIds.length === 0 || isNaN(activityId) || isNaN(instituteId)) {
			throw new BadRequestException(
				'studentId o studentIds, activityId y instituteId deben ser valores válidos.',
			);
		}

		if (!files || files.length === 0) {
			throw new BadRequestException('Se debe subir al menos un archivo.');
		}

		const savedEvidences = await this.evidencesService.processAndSaveEvidenceForStudents(
			files,
			studentIds,
			activityId,
			instituteId,
		);

		return {
			message: 'Evidencia procesada y guardada correctamente en PDF.',
			evidence: savedEvidences[0],
			evidences: savedEvidences,
		};
	}

	@Get('activity/:activityId')
	async getEvidencesByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
		return await this.evidencesService.findByActivity(activityId);
	}

	@Post('physical')
	async setPhysicalDelivery(
		@Body('studentId') studentId: number,
		@Body('activityId') activityId: number,
		@Body('instituteId') instituteId: number,
		@Body('delivered') delivered: boolean,
		@Body('sharedToken') sharedToken?: string,
	) {
		return await this.evidencesService.markPhysicalDelivery(
			Number(studentId),
			Number(activityId),
			Number(instituteId),
			delivered !== false,
			sharedToken,
		);
	}

	@Post('physical-bulk')
	async setBulkPhysicalDelivery(
		@Body('studentIds') studentIds: number[],
		@Body('activityId') activityId: number,
		@Body('instituteId') instituteId: number,
		@Body('delivered') delivered: boolean,
		@Body('isGroup') isGroup?: boolean,
		@Body('sharedToken') sharedToken?: string,
	) {
		return await this.evidencesService.markBulkPhysicalDelivery(
			(studentIds || []).map(Number),
			Number(activityId),
			Number(instituteId),
			delivered !== false,
			isGroup === true,
			sharedToken,
		);
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
	async deleteEvidence(
		@Param('id', ParseIntPipe) id: number,
		@Query('deleteShared') deleteSharedStr: string,
		@Res() res: Response,
	) {
		const deleteShared = deleteSharedStr === 'true';
		const result = await this.evidencesService.deleteEvidence(id, deleteShared);
		return res.status(HttpStatus.OK).json(result);
	}
}

import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceScope } from '../attendance-session.entity';
import { AttendanceStatus } from '../attendance-record.entity';

export class AttendanceRecordItemDto {
	@IsInt()
	studentId: number;

	@IsEnum(AttendanceStatus)
	status: AttendanceStatus;

	@IsOptional()
	@IsString()
	eventTime?: string | null;

	@IsOptional()
	@IsBoolean()
	scannedByMarker?: boolean;

	@IsOptional()
	@IsString()
	note?: string | null;
}

export class SaveAttendanceSessionDto {
	@IsEnum(AttendanceScope)
	scope: AttendanceScope;

	@IsString()
	@IsNotEmpty()
	@Matches(/^\d{4}-\d{2}-\d{2}$/, {
		message: 'date debe tener formato YYYY-MM-DD',
	})
	date: string;

	@IsOptional()
	@IsString()
	closingTime?: string | null;

	@IsInt()
	year: number;

	@IsInt()
	courseId: number;

	@IsOptional()
	@IsInt()
	lessonId?: number | null;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AttendanceRecordItemDto)
	records: AttendanceRecordItemDto[];
}

export class QueryAttendanceDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	courseId?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	year?: number;

	@IsOptional()
	@IsString()
	date?: string;

	@IsOptional()
	@IsEnum(AttendanceScope)
	scope?: AttendanceScope;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	lessonId?: number;
}

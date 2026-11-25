import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
	QueryAttendanceDto,
	SaveAttendanceSessionDto,
} from './dto/attendance.dto';
import { Auth, User } from 'src/common/decorators';
import { Roles, Role } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Get('sessions')
	@ApiOperation({ summary: 'Listar o consultar sesiones de asistencia' })
	findSessions(
		@Query() query: QueryAttendanceDto,
		@User() user: UserEntity,
	) {
		return this.attendanceService.findSessions(query, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Get('sessions/:id')
	@ApiOperation({ summary: 'Obtener una sesión de asistencia por ID' })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.attendanceService.findOne(id);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('sessions')
	@ApiOperation({
		summary: 'Guardar o actualizar una sesión de asistencia y sus registros',
	})
	saveSession(
		@Body() dto: SaveAttendanceSessionDto,
		@User() user: UserEntity,
	) {
		return this.attendanceService.saveSession(dto, user);
	}
}

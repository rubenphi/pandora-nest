import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Grupo } from './grupo.entity';
import { GruposService } from './grupos.service';
import { CreateGrupoDto, UpdateGrupoDto } from './dto';
@Controller('grupos')
export class GruposController {
	constructor(private readonly grupoService: GruposService) {}
	@Get()
	getGrupos(): Promise<Grupo[]> {
		return this.grupoService.getGrupos();
	}
	@Get(':id')
	getGrupo(@Param('id') id: number): Promise<Grupo> {
		return this.grupoService.getGrupo(id);
	}

	@Post()
	createGrupo(@Body() grupo: CreateGrupoDto): Promise<Grupo> {
		return this.grupoService.createGrupo(grupo);
	}

	@Patch(':id')
	updateGrupo(
		@Param('id') id: number,
		@Body() grupo: UpdateGrupoDto,
	): Promise<Grupo> {
		return this.grupoService.updateGrupo(id, grupo);
	}
	@Delete(':id')
	deleteGrupo(@Param('id') id: number): Promise<void> {
		return this.grupoService.deleteGrupo(id);
	}
}

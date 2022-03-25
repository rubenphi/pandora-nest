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
}

@Get()
getGrupos(): Promise<Grupo[]> {
	return this.grupoService.getGrupos();
}

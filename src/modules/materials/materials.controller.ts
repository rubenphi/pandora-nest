import {
	Controller,
	Post,
	Body,
	Patch,
	Param,
	Get,
	Delete,
	Query,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, QueryMaterialDto } from './dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
	constructor(private readonly materialsService: MaterialsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new material' })
	async create(
		@Body() createMaterialDto: CreateMaterialDto,
	) {
		return this.materialsService.create(createMaterialDto);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an existing material' })
	async update(
		@Param('id') id: string,
		@Body() updateMaterialDto: UpdateMaterialDto,
	) {
		return this.materialsService.update(+id, updateMaterialDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all materials' })
	findAll(@Query() query: QueryMaterialDto) {
		return this.materialsService.findAll(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a material by ID' })
	findOne(@Param('id') id: string) {
		return this.materialsService.findOne(+id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a material by ID' })
	remove(@Param('id') id: string) {
		return this.materialsService.remove(+id);
	}
}

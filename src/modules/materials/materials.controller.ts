import {
	Controller,
	Post,
	Body,
	UseInterceptors,
	UploadedFile,
	Patch,
	Param,
	Get,
	Delete,
	Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, QueryMaterialDto } from './dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

import { MaterialType } from './material.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
	constructor(private readonly materialsService: MaterialsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new material' })
	@UseInterceptors(FileInterceptor('file'))
	async create(
		@Body() createMaterialDto: CreateMaterialDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		if (file) {
			createMaterialDto.url = `uploads/${file.filename}`;
			createMaterialDto.content = null; // Ensure content is null if a file is uploaded
		} else if (
			createMaterialDto.type !== MaterialType.TEXT_RICH &&
			createMaterialDto.type !== MaterialType.TEXT_SHORT
		) {
			// If no file is uploaded, and it's not a text type, ensure url is null
			createMaterialDto.url = null;
		}
		return this.materialsService.create(createMaterialDto);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an existing material' })
	@UseInterceptors(FileInterceptor('file'))
	async update(
		@Param('id') id: string,
		@Body() updateMaterialDto: UpdateMaterialDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		if (file) {
			updateMaterialDto.url = `uploads/${file.filename}`;
			updateMaterialDto.content = null; // Ensure content is null if a file is uploaded
		} else if (
			updateMaterialDto.type &&
			updateMaterialDto.type !== MaterialType.TEXT_RICH &&
			updateMaterialDto.type !== MaterialType.TEXT_SHORT
		) {
			// If no file is uploaded, and it's not a text type, ensure url is null
			updateMaterialDto.url = null;
		}
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

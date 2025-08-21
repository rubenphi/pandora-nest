// alumnos.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import fetch from 'node-fetch';

@ApiTags('Alumnos Routes')
@Controller('alumnos')
export class AlumnosController {
	@Get()
	async getAlumnos(@Query('id') id: string, @Query('cookie') cookie: string) {
		const formData = new URLSearchParams();
		formData.append('filterscount', '0');
		formData.append('groupscount', '0');
		formData.append('sortorder', '');
		formData.append('pagenum', '0');
		formData.append('pagesize', '10');
		formData.append('recordstartindex', '0');
		formData.append('recordendindex', '16');
		formData.append('id', id);

		const response = await fetch(
			'https://colegiosonline.com/secure/php/consultas/clistadoalumnos.php',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Cookie: cookie, // Ej: PHPSESSID=...; __cf_bm=...
				},
				body: formData,
			},
		);

		if (!response.ok) {
			throw new Error(`Error HTTP ${response.status}`);
		}

		return await response.json();
	}
}

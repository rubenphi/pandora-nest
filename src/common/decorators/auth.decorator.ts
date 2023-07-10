import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

export function Auth() {
	return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), ApiBearerAuth());
}

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err: any, user: any) {
		// Do not throw an UnauthorizedException if no user or token is provided
		return user || null;
	}
}

import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';

@Injectable()
export class PermissionsService {
	async permissionValidator(user: User, permission: string, module: string) {
		return { user, permission, module };
	}
}

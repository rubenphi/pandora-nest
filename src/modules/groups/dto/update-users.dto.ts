import { IsInt, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserFromGroupDto {
	@IsInt()
	@IsNotEmpty()
	userIdToUpdate: number;

	@IsBoolean()
	@IsNotEmpty()
	active: boolean;
}

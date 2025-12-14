import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { CreateBulkUserItemDto } from './create-bulk-user-item.dto'; // Import the new DTO

export class CreateBulkUserDto {
	@ApiProperty({ type: [CreateBulkUserItemDto] }) // Use the new DTO here
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateBulkUserItemDto) // Use the new DTO here
	readonly users: CreateBulkUserItemDto[];
}

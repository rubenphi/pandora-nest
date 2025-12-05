import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';
import { CreateLessonDto } from '../../lessons/dto/create-lesson.dto';

export class CreateReinforcementLessonDto extends CreateLessonDto {
    @ApiProperty({
        description: 'List of student IDs to assign to this reinforcement',
        type: [Number],
    })
    @IsArray()
    @IsInt({ each: true })
    readonly studentIds: number[];

    @ApiProperty({
        description: 'Teacher ID creating the reinforcement',
    })
    @IsInt()
    readonly teacherId: number;
}

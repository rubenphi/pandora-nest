import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseAccessService } from './course-access.service';
import { Group } from 'src/modules/groups/group.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Quiz } from 'src/modules/quizzes/quiz.entity';
import { UserToCourse } from 'src/modules/users/userToCourse.entity';
import { UserToGroup } from 'src/modules/users/userToGroup.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Quiz,
			Question,
			UserToCourse,
			Group,
			UserToGroup,
		]),
	],
	providers: [CourseAccessService],
	exports: [CourseAccessService],
})
export class CourseAccessModule {}

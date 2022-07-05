import { Answer } from "src/modules/answers/answer.entity";
import { Area } from "src/modules/areas/area.entity";
import { Group } from "src/modules/groups/group.entity";
import { Institute } from "src/modules/institutes/institute.entity";
import { Lesson } from "src/modules/lessons/lesson.entity";
import { Period } from "src/modules/periods/period.entity";
import { Question } from "src/modules/questions/question.entity";
import { User } from "src/modules/users/user.entity";

export type Entity =
	| Area
	| Answer
	| User
	| Group
	| Institute
	| Lesson
	| Period
	| Question
	| 'all';
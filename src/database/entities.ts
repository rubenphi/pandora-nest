import { Activity } from '../modules/activities/activity.entity';
import { ActivityEvidence } from '../modules/activity-evidences/activity-evidence.entity';
import { Answer } from '../modules/answers/answer.entity';
import { Area } from '../modules/areas/area.entity';
import { CourseAreaTeacher } from '../modules/courses/course-area-teacher.entity';
import { CourseArea } from '../modules/courses/course-area.entity';
import { Course } from '../modules/courses/course.entity';
import { Criterion } from '../modules/criteria/criterion.entity';
import { Grade } from '../modules/grades/grade.entity';
import { Group } from '../modules/groups/group.entity';
import { Institute } from '../modules/institutes/institute.entity';
import { Invitation } from '../modules/invitations/invitation.entity';
import { LessonItem } from '../modules/lesson-items/lesson-item.entity';
import { Lesson } from '../modules/lessons/lesson.entity';
import { Material } from '../modules/materials/material.entity';
import { Option } from '../modules/options/option.entity';
import { Period } from '../modules/periods/period.entity';
import { PollOption } from '../modules/polls/poll-option.entity';
import { PollVote } from '../modules/polls/poll-vote.entity';
import { Poll } from '../modules/polls/poll.entity';
import { Question } from '../modules/questions/question.entity';
import { Quiz } from '../modules/quizzes/quiz.entity';
import { ReinforcementGradableItem } from '../modules/reinforcement/reinforcement-gradable-item.entity';
import { Reinforcement } from '../modules/reinforcement/reinforcement.entity';
import { StudentCriterionPermission } from '../modules/student-criterion-scores/student-criterion-permission.entity';
import { StudentCriterionScore } from '../modules/student-criterion-scores/student-criterion-score.entity';
import { SurveyResponse } from '../modules/surveys/survey-response.entity';
import { SurveySession } from '../modules/surveys/survey-session.entity';
import { SurveyTemplate } from '../modules/surveys/survey-template.entity';
import { User } from '../modules/users/user.entity';
import { UserToCourse } from '../modules/users/userToCourse.entity';
import { UserToGroup } from '../modules/users/userToGroup.entity';

export const entities = [
	Activity,
	ActivityEvidence,
	Answer,
	Area,
	CourseAreaTeacher,
	CourseArea,
	Course,
	Criterion,
	Grade,
	Group,
	Institute,
	Invitation,
	LessonItem,
	Lesson,
	Material,
	Option,
	Period,
	PollOption,
	PollVote,
	Poll,
	Question,
	Quiz,
	ReinforcementGradableItem,
	Reinforcement,
	StudentCriterionPermission,
	StudentCriterionScore,
	SurveyResponse,
	SurveySession,
	SurveyTemplate,
	User,
	UserToCourse,
	UserToGroup,
];

import { HttpException, HttpStatus } from "@nestjs/common";
import { validateEquality } from "src/common/utils/validations"
import { User } from "src/modules/users/user.entity";
import { Answer } from "../answers/answer.entity";
import { Area } from "../areas/area.entity";
import { Group } from "../groups/group.entity";
import { Institute } from "../institutes/institute.entity";
import { Lesson } from "../lessons/lesson.entity";
import { Period } from "../periods/period.entity";
import { Question } from "../questions/question.entity";


export enum Rol {
	Admin = 'admin',
	Superadmin = 'superadmin',
	Teacher = 'teacher',
	Student = 'Student',
	User = 'user',
}


export type Entidades = Area | Answer | User | Group | Institute | Lesson | Period | Question

export function abilities(user: User, object: Entidades){
    if(user.rol == Rol.Superadmin){
		return true
	}
	else if(user.rol == Rol.Admin){ 
		var sameInstitute = {
			course: validateEquality(user.institute.id, object,'institute.id'),  
			user: validateEquality(user.institute.id, object,'institute.id'),
			answer: validateEquality(user.institute.id, object,'institute.id'),
			area: validateEquality(user.institute.id, object,'institute.id'),
			question: validateEquality(user.institute.id, object,'institute.id'),
			institute: validateEquality(user.institute.id, object,'id')
		   }
		const result = sameInstitute[object.constructor.name.toLowerCase()]
		if(result == false){
			throw new HttpException({
				status: HttpStatus.FORBIDDEN,
				error: 'You cannot modify elements of another institution',
			  }, HttpStatus.FORBIDDEN);
		}
	}

}


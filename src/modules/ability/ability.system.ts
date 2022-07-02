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



export type Entidades = Area | Answer | User | Group | Lesson | Period | Question


export interface ValidateInterface {
	validate(user:User):boolean
}

export class belongToSameInstitute implements ValidateInterface { 
	entity: Entidades
	constructor(entity: Entidades){
		this.entity = entity
	}
	validate(user){ return validateEquality(user.institute.id,this.entity,"institute.id") }
 }
	
export class InstituteValidator implements ValidateInterface { 
	entity: Institute
	constructor(entity: Institute){
		this.entity = entity
	}
	validate(user: User ){ return validateEquality(user.institute.id,this.entity,"id") } }










export function abilities(user: User, validator:ValidateInterface  ){
    if(user.rol == Rol.Superadmin){
		return true
	}
	else if(user.rol == Rol.Admin){ 
		const result = validator.validate(user)
		if(result == false){
			throw new HttpException({
				status: HttpStatus.FORBIDDEN,
				error: 'You cannot modify elements of another institution',
			  }, HttpStatus.FORBIDDEN);
		}
	}

}


import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

export class OnboardingUserDto {
	@ApiProperty({ description: 'Name of user' })
	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@ApiProperty({ description: 'Last name of user' })
	@IsString()
	@IsNotEmpty()
	readonly lastName: string;

	@ApiProperty({ description: 'Email of user', required: false })
	@IsOptional()
	@ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
	@IsEmail()
	readonly email?: string;

	@ApiProperty({ description: 'Unique user code' })
	@IsString()
	@IsNotEmpty()
	readonly code: string;

	@ApiProperty({ description: 'Telephone number of user', required: false })
	@IsOptional()
	@IsString()
	readonly telephone?: string;

	@ApiProperty({ description: 'Password of user' })
	@IsString()
	@IsNotEmpty()
	readonly password: string;
}

export class OnboardingInstituteDto {
	@ApiProperty({ description: 'Institute name' })
	@IsString()
	@IsNotEmpty()
	readonly name: string;
}

export class OnboardingCourseDto {
	@ApiProperty({ description: 'Initial course name' })
	@IsString()
	@IsNotEmpty()
	readonly name: string;
}

export class RegisterInstituteDto {
	@ApiProperty({ type: OnboardingUserDto })
	@ValidateNested()
	@Type(() => OnboardingUserDto)
	readonly user: OnboardingUserDto;

	@ApiProperty({ type: OnboardingInstituteDto })
	@ValidateNested()
	@Type(() => OnboardingInstituteDto)
	readonly institute: OnboardingInstituteDto;

	@ApiProperty({ type: [String], description: 'Academic periods per year' })
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	readonly periods: string[];

	@ApiProperty({ type: OnboardingCourseDto })
	@ValidateNested()
	@Type(() => OnboardingCourseDto)
	readonly course: OnboardingCourseDto;

	@ApiProperty({ type: [String], description: 'Initial subjects (areas) for the course' })
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	readonly areas: string[];
}

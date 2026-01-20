// pandora-nest/src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Institute } from './modules/institutes/institute.entity';
import { User } from './modules/users/user.entity';
import { Role } from './modules/auth/roles.decorator';

async function bootstrap() {
	// Set NODE_ENV to production for seeding context, so it uses the correct .env path
	process.env.NODE_ENV = 'production';

	const app = await NestFactory.createApplicationContext(AppModule);

	const usersRepository = app.get(getRepositoryToken(User));
	const institutesRepository = app.get(getRepositoryToken(Institute));

	const args = process.argv.slice(2);
	if (args.length < 6) {
		console.error(
			'Usage: node dist/seed.js <instituteName> <adminName> <adminLastName> <adminEmail> <adminCode> <adminPassword>',
		);
		process.exit(1);
	}

	const [
		instituteName,
		adminName,
		adminLastName,
		adminEmail,
		adminCode,
		adminPassword,
	] = args;

	try {
		console.log('Seeding initial data...');

		// 1. Create the admin user WITHOUT an institute first
		const adminUser = usersRepository.create({
			name: adminName,
			lastName: adminLastName,
			email: adminEmail,
			code: adminCode,
			password: adminPassword, // The entity should handle hashing on pre-save
			rol: Role.Admin,
			exist: true, // Set exist to true by default
		});
		await usersRepository.save(adminUser);
		console.log(
			`Admin user "${adminUser.name}" created with ID: ${adminUser.id}`,
		);

		// The password is now hashed. Remove the plain-text version from the object
		// so it doesn't get re-hashed on the next save.
		delete adminUser.password;

		// 2. Create the institute and assign the new user as the owner
		const institute = institutesRepository.create({
			name: instituteName,
			owner: adminUser,
			exist: true,
		});
		await institutesRepository.save(institute);
		console.log(
			`Institute "${institute.name}" created with ID: ${institute.id}`,
		);

		// 3. Update the user to link them to the new institute
		adminUser.institute = institute;
		await usersRepository.save(adminUser);
		console.log('Updated admin user with institute relationship.');

		console.log('Seeding completed successfully!');
	} catch (error) {
		console.error('Seeding failed:', error);
		process.exit(1);
	} finally {
		await app.close();
	}
}

bootstrap();

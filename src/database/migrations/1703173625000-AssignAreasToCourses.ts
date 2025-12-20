import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignAreasToCourses1703173625000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const startDate = '2025-01-01';
		const active = true;

		const assignments = [
			{ courseId: 1, areaId: 1 },
			{ courseId: 2, areaId: 1 },
			{ courseId: 3, areaId: 1 },
			{ courseId: 4, areaId: 1 },
			{ courseId: 5, areaId: 1 },
			{ courseId: 6, areaId: 1 },
			{ courseId: 1, areaId: 2 },
			{ courseId: 1, areaId: 3 },
			{ courseId: 7, areaId: 1 },
			{ courseId: 8, areaId: 1 },
			{ courseId: 1, areaId: 4 },
			{ courseId: 2, areaId: 4 },
			{ courseId: 9, areaId: 1 },
		];

		for (const assignment of assignments) {
			await queryRunner.query(
				`INSERT INTO "course_area" ("course_id", "area_id", "start_date", "active") VALUES (${assignment.courseId}, ${assignment.areaId}, '${startDate}', ${active})`,
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const assignments = [
			{ courseId: 1, areaId: 1 },
			{ courseId: 2, areaId: 1 },
			{ courseId: 3, areaId: 1 },
			{ courseId: 4, areaId: 1 },
			{ courseId: 5, areaId: 1 },
			{ courseId: 6, areaId: 1 },
			{ courseId: 1, areaId: 2 },
			{ courseId: 1, areaId: 3 },
			{ courseId: 7, areaId: 1 },
			{ courseId: 8, areaId: 1 },
			{ courseId: 1, areaId: 4 },
			{ courseId: 2, areaId: 4 },
			{ courseId: 9, areaId: 1 },
		];

		for (const assignment of assignments) {
			await queryRunner.query(
				`DELETE FROM "course_area" WHERE "course_id" = ${assignment.courseId} AND "area_id" = ${assignment.areaId}`,
			);
		}
	}
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGradeSubmissionAndEvaluationStatus1764000000000 implements MigrationInterface {
	name = 'AddGradeSubmissionAndEvaluationStatus1764000000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		const driver = queryRunner.connection.options.type;

		if (driver === 'postgres') {
			await queryRunner.query(
				`ALTER TABLE "grade" ALTER COLUMN "grade" DROP NOT NULL`,
			);
			await queryRunner.query(
				`ALTER TABLE "grade" ALTER COLUMN "grade" SET DEFAULT NULL`,
			);
			await queryRunner.query(
				`ALTER TABLE "grade" ADD COLUMN IF NOT EXISTS "submissionStatus" character varying`,
			);
			await queryRunner.query(
				`ALTER TABLE "grade" ADD COLUMN IF NOT EXISTS "evaluationStatus" character varying`,
			);
		} else {
			// SQLite: add columns if missing; synchronize=true in dev handles nullable grade,
			// and existing 0s are intentionally preserved without mass conversion.
			const table = await queryRunner.getTable('grade');
			if (table && !table.findColumnByName('submissionStatus')) {
				await queryRunner.query(
					`ALTER TABLE "grade" ADD COLUMN "submissionStatus" varchar`,
				);
			}
			if (table && !table.findColumnByName('evaluationStatus')) {
				await queryRunner.query(
					`ALTER TABLE "grade" ADD COLUMN "evaluationStatus" varchar`,
				);
			}
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const driver = queryRunner.connection.options.type;

		if (driver === 'postgres') {
			await queryRunner.query(
				`ALTER TABLE "grade" DROP COLUMN IF EXISTS "evaluationStatus"`,
			);
			await queryRunner.query(
				`ALTER TABLE "grade" DROP COLUMN IF EXISTS "submissionStatus"`,
			);
		}
	}
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorGradesForPolymorphicAssociation1751375603448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grade" ADD "gradableType" character varying`);
        await queryRunner.query(`UPDATE "grade" SET "gradableType" = 'quiz'`);
        await queryRunner.query(`ALTER TABLE "grade" RENAME COLUMN "quizId" TO "gradableId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grade" RENAME COLUMN "gradableId" TO "quizId"`);
        await queryRunner.query(`ALTER TABLE "grade" DROP COLUMN "gradableType"`);
    }

}
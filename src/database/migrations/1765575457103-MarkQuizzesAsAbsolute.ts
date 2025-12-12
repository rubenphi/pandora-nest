import { MigrationInterface, QueryRunner } from "typeorm";
import { EvaluationType } from "../../modules/quizzes/dto/evaluation-type.enum";

export class MarkQuizzesAsAbsolute1765575457103 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find quizzes with "refuerzo" in their title (case-insensitive)
        await queryRunner.query(
            `UPDATE quizzes SET "evaluationType" = '${EvaluationType.ABSOLUTE}' WHERE LOWER(title) LIKE '%refuerzo%'`
        );

        // Find quizzes whose associated lesson's topic contains "plan lector" (case-insensitive)
        await queryRunner.query(
            `UPDATE quizzes SET "evaluationType" = '${EvaluationType.ABSOLUTE}' WHERE "lessonId" IN (SELECT id FROM lesson WHERE LOWER(topic) LIKE '%plan lector%')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert quizzes with "refuerzo" in their title (case-insensitive)
        await queryRunner.query(
            `UPDATE quizzes SET "evaluationType" = '${EvaluationType.RELATIVE}' WHERE LOWER(title) LIKE '%refuerzo%'`
        );

        // Revert quizzes whose associated lesson's topic contains "plan lector" (case-insensitive)
        await queryRunner.query(
            `UPDATE quizzes SET "evaluationType" = '${EvaluationType.RELATIVE}' WHERE "lessonId" IN (SELECT id FROM lesson WHERE LOWER(topic) LIKE '%plan lector%')`
        );
    }

}

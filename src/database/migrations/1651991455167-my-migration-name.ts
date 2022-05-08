import { MigrationInterface, QueryRunner } from "typeorm";

export class myMigrationName1651991455167 implements MigrationInterface {
    name = 'myMigrationName1651991455167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "FK_39caf5d075ae8a8d384fda66951"`);
        await queryRunner.query(`ALTER TABLE "group" RENAME COLUMN "courseId" TO "course_id"`);
        await queryRunner.query(`ALTER TABLE "group" RENAME COLUMN "course_id" TO "courseId"`);
        await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "courseId"`);
        await queryRunner.query(`ALTER TABLE "group" ADD "courseId" integer`);
        await queryRunner.query(`ALTER TABLE "group" ADD "course_id" integer`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "FK_39caf5d075ae8a8d384fda66951" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "FK_f644c24b387124a3fa6ff89f0f1" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "FK_f644c24b387124a3fa6ff89f0f1"`);
        await queryRunner.query(`ALTER TABLE "group" DROP CONSTRAINT "FK_39caf5d075ae8a8d384fda66951"`);
        await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "course_id"`);
        await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "courseId"`);
        await queryRunner.query(`ALTER TABLE "group" ADD "courseId" integer`);
        await queryRunner.query(`ALTER TABLE "group" RENAME COLUMN "courseId" TO "course_id"`);
        await queryRunner.query(`ALTER TABLE "group" RENAME COLUMN "course_id" TO "courseId"`);
        await queryRunner.query(`ALTER TABLE "group" ADD CONSTRAINT "FK_39caf5d075ae8a8d384fda66951" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

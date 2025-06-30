
import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateLessonsToQuizzes1719782400000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Create the quizzes table first
            CREATE TABLE IF NOT EXISTS "quizzes" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "quizType" character varying NOT NULL DEFAULT 'group',
                "lessonId" integer,
                "instituteId" integer,
                CONSTRAINT "PK_quizzes_id" PRIMARY KEY ("id")
            );

            -- Now, populate it from lesson
            INSERT INTO quizzes (title, "lessonId", "instituteId")
            SELECT topic, id, "instituteId" FROM lesson;

            -- Add quizId columns
            ALTER TABLE question ADD COLUMN IF NOT EXISTS "quizId" integer;
            ALTER TABLE answer ADD COLUMN IF NOT EXISTS "quizId" integer;
            ALTER TABLE grade ADD COLUMN IF NOT EXISTS "quizId" integer;

            -- Update question with the new quizId
            UPDATE question
            SET "quizId" = (SELECT id FROM quizzes WHERE "lessonId" = question."lessonId");

            -- Update answer with the new quizId
            UPDATE answer
            SET "quizId" = (SELECT id FROM quizzes WHERE "lessonId" = answer."lessonId");

            -- Update grade with the new quizId
            UPDATE grade
            SET "quizId" = (SELECT id FROM quizzes WHERE "lessonId" = grade."lessonId");

            -- Add foreign key constraints
            ALTER TABLE quizzes ADD CONSTRAINT "FK_quizzes_lessonId" FOREIGN KEY ("lessonId") REFERENCES lesson(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE quizzes ADD CONSTRAINT "FK_quizzes_instituteId" FOREIGN KEY ("instituteId") REFERENCES institute(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE question ADD CONSTRAINT "FK_question_quizId" FOREIGN KEY ("quizId") REFERENCES quizzes(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE answer ADD CONSTRAINT "FK_answer_quizId" FOREIGN KEY ("quizId") REFERENCES quizzes(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE grade ADD CONSTRAINT "FK_grade_quizId" FOREIGN KEY ("quizId") REFERENCES quizzes(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Remove foreign key constraints first
            ALTER TABLE grade DROP CONSTRAINT IF EXISTS "FK_grade_quizId";
            ALTER TABLE answer DROP CONSTRAINT IF EXISTS "FK_answer_quizId";
            ALTER TABLE question DROP CONSTRAINT IF EXISTS "FK_question_quizId";
            ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS "FK_quizzes_instituteId";
            ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS "FK_quizzes_lessonId";

            -- Drop the columns
            ALTER TABLE grade DROP COLUMN IF EXISTS "quizId";
            ALTER TABLE answer DROP COLUMN IF EXISTS "quizId";
            ALTER TABLE question DROP COLUMN IF EXISTS "quizId";

            -- Drop the quizzes table
            DROP TABLE IF EXISTS "quizzes";
        `);
    }

}

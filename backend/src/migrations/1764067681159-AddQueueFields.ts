import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQueueFields1764067681159 implements MigrationInterface {
    name = 'AddQueueFields1764067681159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."queue_entries_status_enum" AS ENUM('waiting', 'serving', 'completed', 'left')`);
        await queryRunner.query(`CREATE TABLE "queue_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "userId" uuid, "phoneNumber" character varying, "fullName" character varying NOT NULL, "queueNumber" character varying NOT NULL, "position" integer NOT NULL, "status" "public"."queue_entries_status_enum" NOT NULL DEFAULT 'waiting', "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, "leftAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e533b14d1153fecfad7767bda5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "serviceTimeMinutes" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "maxQueueCapacity" integer DEFAULT '100'`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "queuePrefix" character varying(10) NOT NULL DEFAULT 'A'`);
        await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "UQ_fb4e674c547ec30683360841ba7" UNIQUE ("queuePrefix")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "UQ_fb4e674c547ec30683360841ba7"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "queuePrefix"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "maxQueueCapacity"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "serviceTimeMinutes"`);
        await queryRunner.query(`DROP TABLE "queue_entries"`);
        await queryRunner.query(`DROP TYPE "public"."queue_entries_status_enum"`);
    }

}

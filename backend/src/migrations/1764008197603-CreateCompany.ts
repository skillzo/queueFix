import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompany1764008197603 implements MigrationInterface {
    name = 'CreateCompany1764008197603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "category" character varying NOT NULL, "imageUrl" character varying, "address" character varying NOT NULL, "latitude" numeric(10,8), "longitude" numeric(11,8), "hours" jsonb, "phoneNumber" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "companies"`);
    }

}

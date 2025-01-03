import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatMessage1735636553504 implements MigrationInterface {
    name = 'UpdateChatMessage1735636553504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`isDeleted\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`type\` enum ('FRIEND_REQUEST_ACCEPTED', 'FRIEND_REQUEST_DECLINED', 'FRIEND_REQUEST_RECEIVED', 'NEW_MESSAGE') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD \`type\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`isDeleted\``);
    }

}

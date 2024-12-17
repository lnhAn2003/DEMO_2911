import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatEntities1734430408091 implements MigrationInterface {
    name = 'UpdateChatEntities1734430408091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` CHANGE \`imageURL\` \`imagesURL\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`imagesURL\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`imagesURL\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`imagesURL\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`imagesURL\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` CHANGE \`imagesURL\` \`imageURL\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}

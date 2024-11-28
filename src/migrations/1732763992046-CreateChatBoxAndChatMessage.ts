import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChatBoxAndChatMessage1732763992046 implements MigrationInterface {
    name = 'CreateChatBoxAndChatMessage1732763992046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`chat_room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9ef6ce8864fa24adf15554a3a1\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_message\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`senderId\` int NOT NULL, \`chatRoomId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chatroom_users\` (\`chatroom_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_bdd827a59e260f7d36781dd2a3\` (\`chatroom_id\`), INDEX \`IDX_def7f834113be4eebc3b66b47e\` (\`user_id\`), PRIMARY KEY (\`chatroom_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_a2be22c99b34156574f4e02d0a0\` FOREIGN KEY (\`senderId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_14b26a0944a258f4035a55d5020\` FOREIGN KEY (\`chatRoomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_14b26a0944a258f4035a55d5020\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_a2be22c99b34156574f4e02d0a0\``);
        await queryRunner.query(`DROP INDEX \`IDX_def7f834113be4eebc3b66b47e\` ON \`chatroom_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_bdd827a59e260f7d36781dd2a3\` ON \`chatroom_users\``);
        await queryRunner.query(`DROP TABLE \`chatroom_users\``);
        await queryRunner.query(`DROP TABLE \`chat_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ef6ce8864fa24adf15554a3a1\` ON \`chat_room\``);
        await queryRunner.query(`DROP TABLE \`chat_room\``);
    }

}

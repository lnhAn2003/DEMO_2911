import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedChatMessageEntity1732851486358 implements MigrationInterface {
    name = 'FixedChatMessageEntity1732851486358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_14b26a0944a258f4035a55d5020\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_a2be22c99b34156574f4e02d0a0\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`senderId\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`chatRoomId\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`sender_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`chat_room_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_bd00cce706735f1c4d05c69a310\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_5c81d912a493823301af1346396\` FOREIGN KEY (\`chat_room_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_5c81d912a493823301af1346396\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP FOREIGN KEY \`FK_bd00cce706735f1c4d05c69a310\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`chat_room_id\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`sender_id\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`chatRoomId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`senderId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_a2be22c99b34156574f4e02d0a0\` FOREIGN KEY (\`senderId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD CONSTRAINT \`FK_14b26a0944a258f4035a55d5020\` FOREIGN KEY (\`chatRoomId\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotification1734404263104 implements MigrationInterface {
    name = 'CreateNotification1734404263104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`CREATE TABLE \`friend\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('PENDING', 'ACCEPTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING', \`requesterId\` int NOT NULL, \`receiverId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('FRIEND_REQUEST_ACCEPTED', 'FRIEND_REQUEST_DECLINED', 'NEW_MESSAGE') NOT NULL, \`message\` varchar(255) NULL, \`chatRoomId\` int NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`receiver_id\` int NOT NULL, \`sender_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`imageURL\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_message\` ADD \`fileURL\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_room\` ADD \`type\` enum ('DIRECT', 'GROUP') NOT NULL DEFAULT 'GROUP'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`profileImageUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`profileDescription\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`friend\` ADD CONSTRAINT \`FK_77431e45d96b9c20941edf49df2\` FOREIGN KEY (\`requesterId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`friend\` ADD CONSTRAINT \`FK_5a5b02c71a15805f570777fb4b5\` FOREIGN KEY (\`receiverId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_90543bacf107cdd564e9b62cd20\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_56023c91b76b36125acd4dcd9c5\` FOREIGN KEY (\`sender_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_bdd827a59e260f7d36781dd2a37\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_56023c91b76b36125acd4dcd9c5\``);
        await queryRunner.query(`ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_90543bacf107cdd564e9b62cd20\``);
        await queryRunner.query(`ALTER TABLE \`friend\` DROP FOREIGN KEY \`FK_5a5b02c71a15805f570777fb4b5\``);
        await queryRunner.query(`ALTER TABLE \`friend\` DROP FOREIGN KEY \`FK_77431e45d96b9c20941edf49df2\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`profileDescription\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`profileImageUrl\``);
        await queryRunner.query(`ALTER TABLE \`chat_room\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`fileURL\``);
        await queryRunner.query(`ALTER TABLE \`chat_message\` DROP COLUMN \`imageURL\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`friend\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_bdd827a59e260f7d36781dd2a37\` FOREIGN KEY (\`chatroom_id\`) REFERENCES \`chat_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

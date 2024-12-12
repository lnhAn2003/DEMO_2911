import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedUserEntity1732849442541 implements MigrationInterface {
    name = 'FixedUserEntity1732849442541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` DROP FOREIGN KEY \`FK_def7f834113be4eebc3b66b47e6\``);
        await queryRunner.query(`ALTER TABLE \`chatroom_users\` ADD CONSTRAINT \`FK_def7f834113be4eebc3b66b47e6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class GocardlessConnection1627128973609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'gocardlessConnection',
        columns: [
          {
            name: 'id',
            type: 'int4',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'key',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'redirectUri',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'webhookSecret',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      false,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE gocardlessConnection`);
  }
}

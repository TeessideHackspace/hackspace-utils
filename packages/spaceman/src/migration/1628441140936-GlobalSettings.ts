import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class GlobalSettings1628441140936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'globalSettings',
        columns: [
          {
            name: 'id',
            type: 'int4',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'siteName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'adminEmail',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      false,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE globalSettings`);
  }
}

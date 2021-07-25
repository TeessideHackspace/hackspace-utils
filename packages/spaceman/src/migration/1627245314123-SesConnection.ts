import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class SesConnection1627245314123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sesConnection',
        columns: [
          {
            name: 'id',
            type: 'int4',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'awsRegion',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'awsAccessKeyId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'awsSecretAccessKey',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      false,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE sesConnection`);
  }
}

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class KeycloakConnection1628449058228 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'keycloakConnection',
        columns: [
          {
            name: 'id',
            type: 'int4',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'keycloakBaseUrl',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'keycloakAdminUsername',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'keycloakAdminPassword',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      false,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE keycloakConnection`);
  }
}

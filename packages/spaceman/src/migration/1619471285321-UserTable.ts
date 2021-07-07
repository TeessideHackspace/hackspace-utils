import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class UserTable1619471285321 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int4',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sub',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'nickname',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gocardlessId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'addressId',
            type: 'int4',
            isNullable: true,
          },
        ],
      }),
      false,
    );

    await queryRunner.createTable(
      new Table({
        name: 'address',
        columns: [
          {
            name: 'id',
            type: 'int4',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'line1',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'line2',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'town',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'postcode',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      false,
    );

    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['addressId'],
        referencedTableName: 'address',
        referencedColumnNames: ['id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE user`);
    queryRunner.query(`DROP TABLE address`);
  }
}

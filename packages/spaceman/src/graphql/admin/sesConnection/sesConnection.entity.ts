import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sesConnection' })
export class SesConnectionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  awsRegion!: string;

  @Column()
  awsAccessKeyId!: string;

  @Column()
  awsSecretAccessKey!: string;
}

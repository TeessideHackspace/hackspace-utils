import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sub!: string;

  @Column()
  nickname?: string;

  @Column()
  gocardlessId?: string;
}

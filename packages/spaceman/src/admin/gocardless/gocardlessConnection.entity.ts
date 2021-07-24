import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'gocardlessConnection' })
export class GocardlessConnectionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  key!: string;

  @Column()
  redirectUri!: string;
}

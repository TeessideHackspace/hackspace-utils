import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'globalSettings' })
export class GlobalSettingsEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  siteName!: string;

  @Column()
  adminEmail!: string;
}

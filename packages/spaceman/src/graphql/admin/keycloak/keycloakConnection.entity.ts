import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'keycloakConnection' })
export class KeycloakConnectionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  keycloakBaseUrl!: string;

  @Column()
  keycloakAdminUsername!: string;

  @Column()
  keycloakAdminPassword!: string;
}

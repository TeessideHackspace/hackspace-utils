import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from './address/address.entity';

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

  @OneToOne(() => Address, (address) => address.user)
  @JoinColumn()
  address?: Address;
}

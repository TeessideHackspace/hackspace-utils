import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToOne(() => User, (user) => user.address)
  user?: User;

  @Column()
  line1!: string;

  @Column()
  line2?: string;

  @Column()
  town!: string;

  @Column()
  postcode!: string;
}

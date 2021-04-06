import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany } from "typeorm";
import { User } from './User'

@Entity()
export class Wiki extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  field: string;

  @Column()
  fieldImg: string;

  @Column()
  fieldDesc: string;

  @ManyToMany(() => User, { cascade: true })
  users: User[]
}

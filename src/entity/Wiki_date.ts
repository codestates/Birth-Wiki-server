import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany } from "typeorm";
import { User } from './User'

@Entity()
export class Wiki_date extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  fieldName: string;

  @Column()
  image: string;

  @ManyToMany(() => User, { cascade: true })
  users: User[]
}

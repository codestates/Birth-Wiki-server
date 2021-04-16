import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany } from "typeorm";
import { User } from './User'

@Entity()
export class Wiki_weekly extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  fieldName: string;

  @Column({nullable: true})
  image: string;

  @ManyToMany(() => User, { cascade: true })
  users: User[]
}

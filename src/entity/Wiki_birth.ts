import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Wiki_date } from "./Wiki_date";

@Entity()
export class Wiki_birth extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: string;

  @Column("text")
  event: string;

  @ManyToOne(() => Wiki_date, { cascade: true })
  date: Wiki_date;
}

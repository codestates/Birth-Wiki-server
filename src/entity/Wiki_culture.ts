import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Wiki_date } from "./Wiki_date";

@Entity()
export class Wiki_culture extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  event: string;

  @ManyToOne(() => Wiki_date, { cascade: true })
  date: Wiki_date;
}

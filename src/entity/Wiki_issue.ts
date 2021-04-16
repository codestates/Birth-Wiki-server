import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Wiki_daily } from "./Wiki_daily";

@Entity()
export class Wiki_issue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: string;

  @Column("text")
  event: string;

  @ManyToOne(() => Wiki_daily, { cascade: true })
  date: Wiki_daily;
}

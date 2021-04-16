import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Wiki_weekly } from "./Wiki_weekly";

@Entity()
export class Wiki_movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  poster: string;

  @ManyToOne(() => Wiki_weekly, { cascade: true })
  date: Wiki_weekly;
}

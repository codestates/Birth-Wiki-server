import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Wiki_weather extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  weather: string;

  @Column({ nullable: true })
  temperature: string;
}

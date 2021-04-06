import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class BirthWiki extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  birthDate: string;

  @Column()
  birthSong: string;

  @Column()
  birthMovie: string;

  @Column()
  birthWeather: string;
}

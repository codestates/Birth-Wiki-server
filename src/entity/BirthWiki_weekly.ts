import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class BirthWiki_weekly extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  weekly: string;

  @Column({ nullable: true })
  WS_title: string;

  @Column({ nullable: true })
  WS_singer: string;

  @Column({ nullable: true })
  WS_poster: string;

  @Column({ nullable: true })
  KS_title: string;

  @Column({ nullable: true })
  KS_singer: string;

  @Column({ nullable: true })
  KS_poster: string;

  @Column({ nullable: true })
  WM_title: string;

  @Column({ nullable: true })
  WM_poster: string;

  @Column({ nullable: true })
  KM_title: string;

  @Column({ nullable: true })
  KM_poster: string;

}

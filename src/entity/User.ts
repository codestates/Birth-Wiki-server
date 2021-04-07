import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Card } from "./Card";
import { Wiki } from "./Wiki";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany((type) => Card, (card) => card.user)
  cards: Card[];

  @ManyToMany(() => Wiki, { cascade: true })
  @JoinTable({
    name: "user_wiki_like",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "wikiId",
      referencedColumnName: "id",
    },
  })
  wikis: Wiki[];
}

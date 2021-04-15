import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { ActionCard } from "./actionCard";
import { Wiki_date } from "./Wiki_date";

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

  @OneToMany(() => ActionCard, (card) => card.user)
  cards: ActionCard[];

  @ManyToMany(() => Wiki_date, { cascade: true })
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
  wikis: Wiki_date[];
}

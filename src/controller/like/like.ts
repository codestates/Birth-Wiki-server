import { getRepository } from "typeorm";
import { Wiki_daily } from "../../entity/Wiki_daily";
import { Wiki_weekly } from "../../entity/Wiki_weekly";
import { RecordCard } from "../../entity/RecordCard";
import { User } from "../../entity/User";

export = async (req, res) => {
  const { action, nickName, cardId, category, accessToken } = req.body;

  try {
    let user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .leftJoinAndSelect("user.dailys", "wiki_daily")
      .leftJoinAndSelect("user.weeklys", "wiki_weekly")
      .leftJoinAndSelect("user.likeRecords", "action_card")
      .getOne();

    let repo;
    let field;
    switch (category) {
      case "issue" || "birth" || "death":
        repo = Wiki_daily;
        field = "wiki_daily";
        break;

      case "music" || "movie":
        repo = Wiki_weekly;
        field = "wiki_weekly";
        break;

      case "record":
        repo = RecordCard;
        field = "record_card";
        break;
    }

    if (action === "like") {
      let targetCard: any = await getRepository(repo)
        .createQueryBuilder(`${field}`)
        .where(`${field}.id = :id`, { id: cardId })
        .getOne();

      switch (category) {
        case "issue" || "birth" || "death":
          user.dailys.push(targetCard);
          break;
        case "music" || "movie":
          user.weeklys.push(targetCard);
          break;
        case "record":
          user.likeRecords.push(targetCard);
          break;
      }
    } else if (action === "cancel") {
      switch (category) {
        case "issue" || "birth" || "death":
          user.dailys = user.dailys.filter((card) => {
            return card.id !== Number(cardId);
          });

          break;

        case "music" || "movie":
          user.weeklys = user.weeklys.filter((card) => {
            return card.id !== Number(cardId);
          });
          break;

        case "record":
          user.likeRecords = user.likeRecords.filter((card) => {
            return card.id !== Number(cardId);
          });
          break;
      }
    }
    await user.save();

    res.send({ message: `${action} success` });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "something wrong" });
  }
};

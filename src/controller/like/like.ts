import { getRepository } from "typeorm";
import { Wiki_weather } from "../../entity/Wiki_weather";
import { Wiki_weekly } from "../../entity/Wiki_weekly";
import { RecordCard } from "../../entity/RecordCard";
import { Wiki_birth } from "../../entity/Wiki_birth";
import { Wiki_daily } from "../../entity/Wiki_daily";
import { Wiki_death } from "../../entity/Wiki_death";
import { Wiki_issue } from "../../entity/Wiki_issue";
import { User } from "../../entity/User";
import coverImg from "../../scrape/dailyImg";

export = async (req, res) => {
  const { action, nickName, cardId, category, accessToken } = req.body;

  let user = await getRepository(User)
    .createQueryBuilder("user")
    .where("user.nickName = :nickName", { nickName })
    .getOne();
  let card;

  if (action === "like") {
    switch (category) {
      case "issue" || "birth" || "death":
        card = await getRepository(Wiki_daily)
          .createQueryBuilder("wiki_daily")
          .where("wiki_daily.id = :id", { id: cardId })
          .getOne();
        user.dailys = [...user.dailys, card];
        await user.save();
        break;

      // case "music" || "movie":
      //   card = await getRepository(Wiki_weekly)
      //     .createQueryBuilder("wiki_weekly")
      //     .where("wiki_weekly.id = :id", { id: cardId })
      //     .getOne();
      //   user.weeklys = [...user.weeklys, card];
      //  await user.save();
      //   break;
    }
  } else {
    switch (category) {
      case "issue" || "birth" || "death":
        user.dailys = user.dailys.filter((wiki) => {
          return wiki.id !== cardId;
        });
        await user.save();
        break;

      // case "music" || "movie":
      //   user.weeklys = user.weeklys.filter((wiki) => {
      //     return wiki.id !== cardId;
      //   });
      //   await user.save();
      //   break;
    }
  }

  res.send({message: `${action} success`})
};

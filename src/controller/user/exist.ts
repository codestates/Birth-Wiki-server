import { User } from "../../entity/User";
import { getRepository } from "typeorm";

export = async (req, res) => {
  const { userEmail, nickName } = req.query;
  let existEmail, existNick;

  if (userEmail) {
    existEmail = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", { userEmail })
      .getOne();

    existEmail
      ? res.status(401).send({ message: "unverified email" })
      : res.send({ message: "verified email" });
  }

  if (nickName) {
    existNick = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .getOne();

    existNick
      ? res.status(401).send({ message: "unverified nickName" })
      : res.send({ message: "verified nickName" });
  }
};

import { getRepository } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";
import { User } from "../../entity/User";
import verification from "../../func/verification";

export = async (req, res) => {
  const { source, nickName, date, privacy, contents, accessToken } = req.body;
  const refreshToken = req.cookies.refreshToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  try {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.nickName = :nickName", { nickName })
      .getOne();

    const oneCase = new RecordCard();
    oneCase.date = date;
    oneCase.cardDesc = contents;
    oneCase.user = user;
    oneCase.privacy = privacy || false;
    if (req.file) {
      oneCase.cardImage = req.file.path;
    }
    await oneCase.save();

    if (verify.action === "change") {
      res.send({
        data: { accessToken: verify.accessToken },
        message: "create record",
      });
    } else {
      res.send({
        message: `create record`,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "something wrong" });
  }
};

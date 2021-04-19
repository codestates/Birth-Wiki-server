import { getRepository } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";
import { User } from "../../entity/User";

export = async (req, res) => {
  const { nickName, date, privacy, contents, accessToken } = req.body;
  if (!accessToken) {
    res.send({ message: "토큰없쪙" });
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

    res.send({ message: "create record" });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "something wrong" });
  }
};

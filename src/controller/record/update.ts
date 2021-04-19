import { getRepository } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";

export = async (req, res) => {
  const { nickName, cardId, privacy, contents, accessToken } = req.body;
  try {
    const oneCase = await getRepository(RecordCard)
      .createQueryBuilder("record_card")
      .where("record_card.id = :id", { id: cardId })
      .getOne();

    oneCase.cardDesc = contents;
    oneCase.privacy = privacy;
    if (req.file) {
      oneCase.cardImage = req.file.path;
    }
    await oneCase.save();

    res.send({ message: "update record" });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "something wrong" });
  }
};

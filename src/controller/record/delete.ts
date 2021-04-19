import { getConnection } from "typeorm";
import { RecordCard } from "../../entity/RecordCard";

export = async (req, res) => {
  const { nickName, cardId, accessToken } = req.body;
  try {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(RecordCard)
      .where("record_card.id = :id", { id: cardId })
      .execute();

    res.send({ message: "delete record" });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "something wrong" });
  }
};

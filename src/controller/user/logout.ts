import { getConnection } from "typeorm";
import { Refresh } from "../../entity/Refresh";
import("dotenv/config");

export = async (req, res) => {
  try {
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Refresh)
      .where("hashRT = :hashRT", { hashRT: req.cookies.refreshToken })
      .execute();

    res
      .clearCookie("refreshToken", {
        domain: "localhost",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({ message: "logOut" });
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};

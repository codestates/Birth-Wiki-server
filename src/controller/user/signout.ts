import { getConnection } from "typeorm";
import { User } from "../../entity/User";
import { Refresh } from "../../entity/Refresh";
import crypto from "crypto";
import("dotenv/config");

export = async (req, res) => {
  const { userEmail, password } = req.body;

  const hashPW = crypto
    .createHmac("sha256", process.env.SHA_PW)
    .update(password)
    .digest("hex");

  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("userEmail = :userEmail", { userEmail })
    .andWhere("password = :password", { password: hashPW })
    .execute();

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
    .send({ message: "signOut" });
};

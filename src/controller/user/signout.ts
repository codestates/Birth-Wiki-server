import { getConnection } from "typeorm";
import { User } from "../../entity/User";
import crypto from "crypto";
import axios from "axios";
import verification from "../../func/verification";
import("dotenv/config");

export = async (req, res) => {
  let { source, nickName, accessToken, password } = req.body;
  const refreshToken = req.cookies.refreshToken;

  accessToken = accessToken.includes("Bearer")
    ? accessToken.slice(7)
    : accessToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  if (verify.action === "change") {
    accessToken = verify.accessToken;
  }

  try {
    if (source === "home") {
      const hashPW = crypto
        .createHmac("sha256", process.env.SHA_PW)
        .update(password)
        .digest("hex");

      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(User)
        .where("nickName = :nickName", { nickName })
        .andWhere("password = :password", { password: hashPW })
        .execute();
    }

    if (source === "google") {
      await axios({
        url: "https://oauth2.googleapis.com/revoke",
        method: "POST",
        params: {
          token: encodeURI(accessToken),
        },
      })
        .then(async () => {
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(User)
            .where("nickName = :nickName", { nickName })
            .execute();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (source === "naver") {
      await axios({
        url: "https://nid.naver.com/oauth2.0/token",
        params: {
          client_id: process.env.N_CLIENTID,
          client_secret: process.env.N_CLIENTSR,
          access_token: encodeURI(accessToken),
          service_provider: "NAVER",
          grant_type: "delete",
        },
      })
        .then(async () => {
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(User)
            .where("nickName = :nickName", { nickName })
            .execute();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (source === "kakao") {
      await axios({
        url: "https://kapi.kakao.com/v1/user/unlink",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(async () => {
          await getConnection()
            .createQueryBuilder()
            .delete()
            .from(User)
            .where("nickName = :nickName", { nickName })
            .execute();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    res
      .clearCookie("refreshToken", {
        domain: "localhost",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({ message: "signOut" });
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};

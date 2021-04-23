import axios from "axios";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { Refresh } from "../entity/Refresh";
import { User } from "../entity/User";
import("dotenv/config");

export = async (source: string, accessToken: string, refreshToken: string) => {
  accessToken = accessToken.includes("Bearer")
    ? accessToken.slice(7)
    : accessToken;

  let returnOBJ = {
    action: "equal",
    accessToken: accessToken,
  };

  try {
    if (source === "home") {
      let result = true;

      jwt.verify(accessToken, process.env.SHA_AT, (err, decoded: any) => {
        if (err) {
          result = false;
        } else if (decoded.exp - decoded.iat < 600) {
          result = false;
        }
      });

      if (!result) {
        const realRT = await getRepository(Refresh)
          .createQueryBuilder("refresh")
          .where("refresh.hashRT = :hashRT", { hashRT: refreshToken })
          .getOne();

        let decodedRT: any = jwt.verify(realRT.token, process.env.SHA_RT);
        let user = await getRepository(User)
          .createQueryBuilder("user")
          .where("user.id = :id", { id: decodedRT.id })
          .getOne();

        delete user.password;
        let newToken = jwt.sign({ ...user }, process.env.SHA_AT, {
          expiresIn: 3600,
        });

        returnOBJ.action = "change";
        returnOBJ.accessToken = newToken;
      }
    }

    if (source === "google") {
      await axios({
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
        method: "get",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }).catch(async () => {
        const realRT = await getRepository(Refresh)
          .createQueryBuilder("refresh")
          .where("refresh.hashRT = :hashRT", { hashRT: refreshToken })
          .getOne();

        await axios({
          url: "https://oauth2.googleapis.com/token",
          method: "POST",
          data: {
            client_id: process.env.G_CLIENTID,
            client_secret: process.env.G_CLIENTSR,
            refresh_token: realRT.token,
            grant_type: "refresh_token",
          },
        }).then((res) => {
          returnOBJ.action = "change";
          returnOBJ.accessToken = res.data.access_token;
        });
      });
    }

    if (source === "naver") {
      await axios({
        url: "https://openapi.naver.com/v1/nid/me",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(async () => {
        const realRT = await getRepository(Refresh)
          .createQueryBuilder("refresh")
          .where("refresh.hashRT = :hashRT", { hashRT: refreshToken })
          .getOne();

        await axios({
          url: "https://nid.naver.com/oauth2.0/token",
          params: {
            client_id: process.env.N_CLIENTID,
            client_secret: process.env.N_CLIENTSR,
            refresh_token: realRT.token,
            grant_type: "refresh_token",
          },
        }).then((res) => {
          returnOBJ.action = "change";
          returnOBJ.accessToken = res.data.access_token;
        });
      });
    }

    if (source === "kakao") {
      await axios({
        url: "https://kapi.kakao.com/v2/user/me",
        method: "post",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(async () => {
        const realRT = await getRepository(Refresh)
          .createQueryBuilder("refresh")
          .where("refresh.hashRT = :hashRT", { hashRT: refreshToken })
          .getOne();

        const {
          data: { access_token, refresh_token },
        } = await axios({
          url: "https://kauth.kakao.com/oauth/token",
          method: "POST",
          params: {
            client_id: process.env.K_CLIENTID,
            client_secret: process.env.K_CLIENTSR,
            refresh_token: realRT.token,
            grant_type: "refresh_token",
          },
        });
        returnOBJ.action = "change";
        returnOBJ.accessToken = access_token;

        if (refresh_token) {
          realRT.token = refresh_token;
          await realRT.save();
        }
      });
    }
    return returnOBJ;
  } catch (err) {
    console.log("토큰 검사", err);
    returnOBJ.action = "error";
    return returnOBJ;
  }
};

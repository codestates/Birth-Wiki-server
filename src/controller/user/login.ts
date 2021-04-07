import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import { Refresh } from "../../entity/Refresh";
import axios from "axios";
import("dotenv/config");

export = async (req, res) => {
  const { AuthorizationCode, source, userEmail, password } = req.body;

  if (source === "home") {
    const hashPW = crypto
      .createHmac("sha256", process.env.SHA_PW)
      .update(password)
      .digest("hex");

    const user = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", { userEmail })
      .andWhere("user.password = :password", { password: hashPW })
      .getOne();

    if (!user) {
      res.status(401).send("getout");
    } else {
      delete user.password;
      let accessToken = jwt.sign({ ...user }, process.env.SHA_AT, {
        expiresIn: 3600,
      });

      let refreshToken = jwt.sign({ id: user.id }, process.env.SHA_RT, {
        expiresIn: 50400,
      });

      const refresh = new Refresh();
      refresh.token = refreshToken;
      await refresh.save();

      const hashRT = crypto
        .createHmac("sha256", process.env.SHA_RT)
        .update(String(refresh.id))
        .digest("hex");

      refresh.hashRT = hashRT;
      await refresh.save();

      res
        .cookie("refreshToken", hashRT, {
          domain: "localhost",
          path: "/",
          sameSite: "none",
          httpOnly: true,
          secure: true,
        })
        .send({ data: { ...user, accessToken: accessToken } });
    }
  }

  if (source === "google") {
    const {
      data: { access_token, refresh_token },
    } = await axios({
      url: "https://oauth2.googleapis.com/token",
      method: "post",
      data: {
        client_id: process.env.G_CLIENTID,
        client_secret: process.env.G_CLIENTSR,
        code: AuthorizationCode,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
      },
    });

    const profile = await axios({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      method: "get",
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });

    const existUser = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", {
        userEmail: profile.data.email,
      })
      .getOne();

    if (!existUser) {
      const user = new User();
      user.userEmail = profile.data.email;
      await user.save();
    }

    const refresh = new Refresh();
    refresh.token = refresh_token;
    await refresh.save();

    const hashRT = crypto
      .createHmac("sha256", process.env.SHA_RT)
      .update(String(refresh.id))
      .digest("hex");

    refresh.hashRT = hashRT;
    await refresh.save();

    res
      .cookie("refreshToken", hashRT, {
        domain: "localhost",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({
        data: { userEmail: profile.data.email, accessToken: access_token },
      });
  }

  if (source === "kakao") {
    const {
      data: { access_token, refresh_token },
    } = await axios({
      url: "https://kauth.kakao.com/oauth/token",
      method: "post",
      params: {
        client_id: process.env.K_CLIENTID,
        client_secret: process.env.K_CLIENTSR,
        code: AuthorizationCode,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
      },
    });

    const profile = await axios({
      url: "https://kapi.kakao.com/v2/user/me",
      method: "post",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const existUser = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", {
        userEmail: String(profile.data.id),
      })
      .getOne();

    if (!existUser) {
      const user = new User();
      user.userEmail = String(profile.data.id);
      if (profile.data.kakao_account.profile.profile_image_url) {
        user.profileImage =
          profile.data.kakao_account.profile.profile_image_url;
      }
      await user.save();
    }

    const refresh = new Refresh();
    refresh.token = refresh_token;
    await refresh.save();

    const hashRT = crypto
      .createHmac("sha256", process.env.SHA_RT)
      .update(String(refresh.id))
      .digest("hex");

    refresh.hashRT = hashRT;
    await refresh.save();

    res
      .cookie("refreshToken", hashRT, {
        domain: "localhost",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({
        data: { userEmail: profile.data.id, accessToken: access_token },
      });
  }

  if (source === "naver") {
    const {
      data: { access_token, refresh_token },
    } = await axios({
      url: "https://nid.naver.com/oauth2.0/token",
      method: "post",
      params: {
        client_id: process.env.N_CLIENTID,
        client_secret: process.env.N_CLIENTSR,
        code: AuthorizationCode,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
      },
    });

    const profile = await axios({
      url: "https://openapi.naver.com/v1/nid/me",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const existUser = await getRepository(User)
      .createQueryBuilder("user")
      .where("user.userEmail = :userEmail", {
        userEmail: String(profile.data.response.email),
      })
      .getOne();

    if (!existUser) {
      const user = new User();
      user.userEmail = profile.data.response.email;
      user.nickName = profile.data.response.nickname;
      user.profileImage = profile.data.response.profile_image;
      await user.save();
    }

    const refresh = new Refresh();
    refresh.token = refresh_token;
    await refresh.save();

    const hashRT = crypto
      .createHmac("sha256", process.env.SHA_RT)
      .update(String(refresh.id))
      .digest("hex");

    refresh.hashRT = hashRT;
    await refresh.save();

    res
      .cookie("refreshToken", hashRT, {
        domain: "localhost",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({
        data: { userEmail: profile.data.response.email, accessToken: access_token },
      });
  }
};

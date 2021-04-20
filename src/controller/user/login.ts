import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import { Refresh } from "../../entity/Refresh";
import getLikeCard from "../../func/getLikeCard";
import("dotenv/config");

export = async (req, res) => {
  const { AuthorizationCode, source, userEmail, password } = req.body;

  let nickName;
  let profileImage;
  let accessToken;
  let hashRT;
  let email = userEmail;

  try {
    if (source === "home") {
      const hashPW = crypto
        .createHmac("sha256", process.env.SHA_PW)
        .update(password)
        .digest("hex");

      const user = await getRepository(User)
        .createQueryBuilder("user")
        .where("user.userEmail = :userEmail", { userEmail })
        .andWhere("user.password = :password", { password: hashPW })
        .leftJoinAndSelect("user.refresh", "refresh")
        .getOne();

      if (!user) {
        res.status(401).send({ message: "unregistered user" });
        return;
      } else {
        delete user.password;
        accessToken = jwt.sign({ ...user }, process.env.SHA_AT, {
          expiresIn: 3600,
        });
        nickName = user.nickName;
        profileImage = user.profileImage
          ? `https://server.birthwiki.space/${user.profileImage}`
          : null;

        if (user.refresh) {
          hashRT = user.refresh.hashRT;
        } else {
          let refreshToken = jwt.sign({ id: user.id }, process.env.SHA_RT);

          const refresh = new Refresh();
          refresh.user = user;
          refresh.token = refreshToken;
          await refresh.save();

          user.refresh = refresh;
          await user.save();

          hashRT = crypto
            .createHmac("sha256", process.env.SHA_RT)
            .update(String(refresh.id))
            .digest("hex");

          refresh.hashRT = hashRT;
          await refresh.save();
        }
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
          redirect_uri: process.env.REDIRECT_URI,
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
        .leftJoinAndSelect("user.refresh", "refresh")
        .getOne();

      email = profile.data.email;
      accessToken = access_token;
      if (!existUser) {
        nickName = profile.data.name;
        profileImage = profile.data.picture;

        let user = new User();
        user.userEmail = profile.data.email;
        user.nickName = nickName;
        user.profileImage = profileImage;
        await user.save();

        let refresh = new Refresh();
        refresh.user = user;
        refresh.token = refresh_token;
        await refresh.save();

        hashRT = crypto
          .createHmac("sha256", process.env.SHA_RT)
          .update(String(refresh.id))
          .digest("hex");

        refresh.hashRT = hashRT;
        await refresh.save();

        user.refresh = refresh;
        await user.save();
      } else {
        nickName = existUser.nickName;
        profileImage = existUser.profileImage;
        hashRT = existUser.refresh.hashRT;
        if (refresh_token) {
          let refresh = await getRepository(Refresh)
            .createQueryBuilder("refresh")
            .where("refresh.hashRT = :hashRT", { hashRT })
            .getOne();
          refresh.token = refresh_token;
          await refresh.save();
        }
      }
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
          redirect_uri: process.env.REDIRECT_URI,
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
        .leftJoinAndSelect("user.refresh", "refresh")
        .getOne();

      email = profile.data.id;
      accessToken = access_token;
      if (!existUser) {
        nickName = profile.data.kakao_account.profile.nickname;
        profileImage = profile.data.kakao_account.profile.profile_image_url;

        const user = new User();
        user.userEmail = String(profile.data.id);
        user.nickName = nickName;
        user.profileImage = profileImage;

        await user.save();

        const refresh = new Refresh();
        refresh.token = refresh_token;
        refresh.user = user;
        await refresh.save();

        hashRT = crypto
          .createHmac("sha256", process.env.SHA_RT)
          .update(String(refresh.id))
          .digest("hex");

        refresh.hashRT = hashRT;
        await refresh.save();

        user.refresh = refresh;
        await user.save();
      } else {
        nickName = existUser.nickName;
        profileImage = existUser.profileImage;
        hashRT = existUser.refresh.hashRT;

        if (refresh_token) {
          const refresh = await getRepository(Refresh)
            .createQueryBuilder("refresh")
            .where("refresh.hashRT = :hashRT", { hashRT })
            .getOne();
          refresh.token = refresh_token;
          await refresh.save();
        }
      }
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
          redirect_uri: process.env.REDIRECT_URI,
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
        .leftJoinAndSelect("user.refresh", "refresh")
        .getOne();

      email = profile.data.response.email;
      accessToken = access_token;
      if (!existUser) {
        nickName = profile.data.response.nickname;
        profileImage = profile.data.response.profile_image;

        const user = new User();
        user.userEmail = profile.data.response.email;
        user.nickName = nickName;
        user.profileImage = profileImage;
        await user.save();

        const refresh = new Refresh();
        refresh.user = user;
        refresh.token = refresh_token;
        await refresh.save();

        hashRT = crypto
          .createHmac("sha256", process.env.SHA_RT)
          .update(String(refresh.id))
          .digest("hex");

        refresh.hashRT = hashRT;
        await refresh.save();

        user.refresh = refresh;
        await user.save();
      } else {
        hashRT = existUser.refresh.hashRT;
        nickName = existUser.nickName;
        profileImage = existUser.profileImage;

        if (refresh_token) {
          const refresh = await getRepository(Refresh)
            .createQueryBuilder("refresh")
            .where("refresh.hashRT = :hashRT", { hashRT })
            .getOne();
          refresh.token = refresh_token;
          await refresh.save();
        }
      }
    }

    let userCard = await getLikeCard(nickName);

    res
      .cookie("refreshToken", hashRT, {
        domain: "localhost",
        path: "/",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .send({
        data: {
          userEmail: email,
          nickName,
          profileImage,
          accessToken,
          likeCards: userCard.likeCards,
          recordCards: userCard.recordCards,
        },
      });
  } catch (err) {
    console.log("login\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};

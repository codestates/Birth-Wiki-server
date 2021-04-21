import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../../entity/User";
import { Refresh } from "../../entity/Refresh";
import getLikeCard from "../../func/getLikeCard";
import verification from "../../func/verification";
import("dotenv/config");

export = async (req, res) => {
  const { source, userEmail, nickName, accessToken } = req.body;
  const refreshToken = req.cookies.refreshToken;

  let verify = await verification(source, accessToken, refreshToken);

  if (verify.action === "error") {
    res.status(403).send({ message: "unavailable token" });
    return;
  }

  try {
    let userCard = await getLikeCard(nickName);

    res.send({
      data: {
        accessToken,
        likeCards: userCard.likeCards,
        recordCards: userCard.recordCards,
      },
    });
  } catch (err) {
    console.log("userLikeCard\n", err);
    res.status(400).send({ message: "something wrong" });
  }
};

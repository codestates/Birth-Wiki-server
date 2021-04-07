import { User } from "../../entity/User";
import crypto from "crypto";
import("dotenv/config");

export = async (req, res) => {
  const { userEmail, nickName, password } = req.body;

  try {
    const hashPW = crypto
      .createHmac("sha256", process.env.SHA_PW)
      .update(password)
      .digest("hex");

    const user = new User();
    user.userEmail = userEmail;
    user.nickName = nickName;
    user.password = hashPW;
    if (req.file) {
      user.profileImage = req.file.path;
    }
    await user.save();

    res.send("signup!");
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};

export = async (req, res) => {
  try {
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

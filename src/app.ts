import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";
import userRouter from "./route/user";
import cookieParser from "cookie-parser";

const app: express.Application = express();
const port: number = 4000;

createConnection()
  .then(() => {
    console.log("connected");
  })
  .catch((error) => console.log(error));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/image", express.static("image"));

app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

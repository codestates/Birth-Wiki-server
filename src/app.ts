import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";

const app: express.Application = express();
const port: number = 3000;

createConnection()
  .then(() => {
    console.log("connected");
  })
  .catch((error) => console.log(error));

app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req: express.Request, res: express.Response) => {
  res.json({
    message: "Hello TypeScript!",
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

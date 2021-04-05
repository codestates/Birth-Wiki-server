import express from "express";
import router from "./router/router";

const app = express();
const port: number = 3000;

app.use("/router", router);

app.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send("Hello World!");
  }
);

app.listen(port, () => {
  console.log(`on ${port}!`);
});

import express from "express";
import { likeController } from "../controller";
const router = express.Router();

router.post("/like", likeController.date);

export = router;

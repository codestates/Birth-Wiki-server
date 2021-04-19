import express from "express";
import { likeController } from "../controller";
const router = express.Router();

router.post("/", likeController.like);

export = router;

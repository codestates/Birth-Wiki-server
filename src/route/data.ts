import express from "express";
import { dataController } from "../controller";
const router = express.Router();

router.post("/date", dataController.date);

export = router;

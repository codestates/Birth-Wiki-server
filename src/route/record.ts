import express from "express";
import { recordController } from "../controller";
const router = express.Router();

router.post("/create", recordController.create);
router.patch("/update", recordController.update);
router.delete("/delete", recordController.delete);

export = router;

import express from "express";
import BinController from "../controllers/BinController";

const router = express.Router();

router.get("/bin", BinController.getBin);

export default router;

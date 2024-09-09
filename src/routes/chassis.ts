import express from "express";
import ChassisController from "../controllers/ChassisController";

const router = express.Router();

router.get("/chassis", ChassisController.getChassis);

export default router;

import express from "express";
import VehiclesController from "../controllers/VehiclesController";

const router = express.Router();

router.get("/vehicles", VehiclesController.getVehicles);

export default router;

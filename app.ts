import express from "express";
import cors from "cors";
import { router } from "./src/routes";
import "dotenv/config";

const PORT = process.env.PORT || 3333;

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => console.log(`Chassis is running on port ${PORT}`));

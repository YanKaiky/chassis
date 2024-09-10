import { Router } from "express";
import chassis from "./chassis";
import bin from "./bin";
import vehicles from "./vehicles";

const router = Router();

router.get("/", (_, response) =>
  response.status(200).json({
    message: `© ${new Date().getUTCFullYear()}, Scrapping - ${new Date().toLocaleString(
      "pt-BR"
    )}`,
  })
);

router.use(chassis);

router.use(bin);

router.use(vehicles);

export { router };

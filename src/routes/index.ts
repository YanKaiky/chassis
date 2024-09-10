import { Router } from "express";
import chassis from "./chassis";
import bin from "./bin";

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

export { router };

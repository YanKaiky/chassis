import { Router } from "express";
import chassis from "./chassis";

const router = Router();

router.get("/", (_, response) =>
  response.status(200).json({
    message: `© ${new Date().getUTCFullYear()}, Scrapping - ${new Date().toLocaleString(
      "pt-BR"
    )}`,
  })
);

router.use(chassis);

export { router };

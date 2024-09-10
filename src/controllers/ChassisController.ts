import { Request, Response } from "express";
import ChassisService from "../services/ChassisService";
import { ParsedQs } from "../helpers/types";

class ChassisController {
  async getChassis(request: Request, response: Response) {
    const chassi: string | ParsedQs | string[] | ParsedQs[] | undefined =
      request.query.q;

    if (!chassi) {
      return response.status(400).json({ message: "Query `q` is required" });
    }

    const chassis = await ChassisService.getChassis(chassi);

    if (!chassis) {
      return response.status(400).json({ message: "INVALID_CHASSIS" });
    }

    return response.status(200).json(chassis);
  }
}

export default new ChassisController();

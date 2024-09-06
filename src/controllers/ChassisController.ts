import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import ChassisService from "../services/ChassisService";
import { ResponseError } from "../exceptions/ResponseError";

type ParsedQs = /*unresolved*/ any

class ChassisController {
  async getChassis(request: Request, response: Response) {
    try {
      const chassi: string | ParsedQs | string[] | ParsedQs[] | undefined = request.query.q;

      if (!chassi) {
        return response.status(400).json({ message: "Query `q` is required" });
      }

      const chassis = await ChassisService.getChassis(chassi);

      return response.status(200).json(chassis);
    } catch (error: any) {
      console.log(error);

      if (error instanceof ResponseError) {
        response.status(error.status).json({ message: error });
      }

      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
}

export default new ChassisController();

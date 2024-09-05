import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import ChassisService from "../services/ChassisService";
import { ResponseError } from "../exceptions/ResponseError";

class ChassisController {
  async getChassis(_: Request, response: Response) {
    try {
      const chassis = await ChassisService.getChassis();

      return response.status(200).json(chassis);
    } catch (error: any) {
      console.log(error);

      if (error instanceof ResponseError) {
        response
          .status(error.status)
          .json({ message: error });
      }

      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
}

export default new ChassisController();

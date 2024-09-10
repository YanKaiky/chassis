import { Request, Response } from "express";
import VehiclesService from "../services/VehiclesService";

class VehiclesController {
  async getVehicles(request: Request, response: Response) {
    const documentNumber = request.query.document;

    if (!documentNumber) {
      return response
        .status(400)
        .json({ message: "Query `document` is required" });
    }

    const vehicles = await VehiclesService.getVehicles(String(documentNumber));

    if (!vehicles) {
      return response.status(400).json({ message: "INVALID_REQUEST" });
    }

    return response.status(200).json(vehicles);
  }
}

export default new VehiclesController();

import { Request, Response } from "express";
import BinService, { BinTypeQuery } from "../services/BinService";

class BinController {
  async getBin(request: Request, response: Response) {
    const { key, type } = request.query;

    if (!key) {
      return response.status(400).json({
        message: "Query `key` is required",
      });
    }

    if (String(type) in BinTypeQuery) {
      const bin = await BinService.getBin(
        String(key),
        String(type ?? BinTypeQuery.plate)
      );

      if (!bin) {
        return response.status(400).json({ message: "INVALID_REQUEST" });
      }

      return response.status(200).json(bin);
    } else {
      return response.status(400).json({ message: "INVALID_QUERY_TYPE" });
    }
  }
}

export default new BinController();

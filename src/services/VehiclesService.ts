import * as puppeteer from "puppeteer";
import { openBrowser } from "../helpers";

class VehiclesService {
  async getVehicles(document_number: string) {
    console.log(document_number);

    return "OK";
  }
}

export default new VehiclesService();

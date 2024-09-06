import * as puppeteer from "puppeteer";
import { clickButton, hoverFieldsets, typeInField } from "../helpers";

class ChassisService {
  async getChassis(chassi: string) {
    /**
     * Start Browser
     */
    const page = await this.openBrowser();

    /**
     * Hover Menu - CAR Icon
     */
    await hoverFieldsets("#\\32", page);

    /**
     * Hover Menu > CAR Icon > SNG
     */
    await hoverFieldsets("#\\32 -5", page);

    /**
     * Hover Menu > CAR Icon > SNG > Tr 781 - Consulta situação veículo
     */
    await clickButton("#\\32 -5 > ul > li:nth-child(1) > a", page);

    /**
     * Access URL to Tr 781 - Consulta situação veículo
     */
    await page.goto(String(process.env.DETRAN_NET_URL_SNG_T781), {
      waitUntil: "networkidle2",
    });

    /**
     * Type in field Chassis
     */
    await typeInField("#chassi", chassi, page);

    /**
     * Click search Chassi - Button Consultar
     */
    await clickButton("#btn_C", page);

    return { message: "OK" };
  }

  private async openBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();

    await page.authenticate({
      username: String(process.env.DETRAN_NET_CPF),
      password: String(process.env.DETRAN_NET_PASSWORD),
    });

    await page.goto(String(process.env.DETRAN_NET_URL), {
      waitUntil: "networkidle2",
    });

    return page;
  }
}

export default new ChassisService();

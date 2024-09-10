import * as puppeteer from "puppeteer";
import {
  clickButton,
  goToURL,
  hoverFieldsets,
  openBrowser,
  typeInField,
} from "../helpers";

export enum BinTypeQuery {
  chassis = "chassis",
  plate = "plate",
  renavam = "renavam",
}

class BinService {
  async getBin(key: string, type: string) {
    const browser = await puppeteer.launch({
      headless: false,
    });

    /**
     * Start Browser
     */
    const page = await openBrowser(browser);

    await this.accessBinRenavam(key, type, page);

    const data = await this.extractDataPage(page, browser);

    if (!data) return null;

    return data;
  }

  private async accessBinRenavam(
    key: string,
    type: string | BinTypeQuery,
    page: puppeteer.Page
  ): Promise<void> {
    /**
     * Hover Menu - CAR Icon
     */
    await hoverFieldsets("#\\32", page);

    /**
     * Hover Menu > CAR Icon > SNG
     */
    await hoverFieldsets("#\\32 -11", page);

    /**
     * Hover Menu > CAR Icon > SNG > Tr 781 - Consulta situação veículo
     */
    await clickButton("#\\32 -11 > ul > li:nth-child(1) > a", page);

    /**
     * Access URL to Tr 781 - Consulta situação veículo
     */
    await goToURL(process.env.DETRAN_NET_URL_BIN, page);

    /**
     * Type in field Chassis
     */
    await typeInField("#dado", key, page);

    /**
     * Click search Chassi - Button Consultar
     */
    await this.clickSearchButton(type, page);
  }

  private async extractDataPage(
    page: puppeteer.Page,
    browser: puppeteer.Browser
  ): Promise<any> {
    console.log({ message: "Aquii" });

    await browser.close();
  }

  private async clickSearchButton(
    type: string | BinTypeQuery,
    page: puppeteer.Page
  ): Promise<puppeteer.Page> {
    let button;

    switch (type) {
      case BinTypeQuery.chassis:
        button = "#btn_C_BINChassi";
        break;
      case BinTypeQuery.renavam:
        button = "#btn_C_BINRenavam";
        break;
      default:
        button = "#btn_C_BINPlaca";
        break;
    }

    /**
     * @option #btn_C_BINPlaca
     * @option #btn_C_BINRenavam
     * @option #btn_C_BINChassi
     */
    await clickButton(button, page);

    return page;
  }
}

export default new BinService();

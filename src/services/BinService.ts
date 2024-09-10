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
    await page.waitForSelector(
      "#form1 > div.card > div > table > tbody > tr:nth-child(1) > td:nth-child(1)"
    );

    let window: any;
    let document: any;

    const data = await page.evaluate(async () => {
      const row: any = {};

      const table = document.querySelector("#form1 > div.card > div > table");

      for (let i = 0; i < table.rows.length; i++) {
        const objCells = table.rows.item(i).cells;

        for (let j = 0; j < objCells.length; j++) {
          const text = objCells.item(j).innerHTML.trim();

          const labelMatch = text.match(/<div[^>]*>(.*?)<\/div>/);
          const label = labelMatch ? labelMatch[1].trim() : "";

          let value: string = text
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .replace(label, "")
            .trim();

          if (value.endsWith("(NACIONAL )")) {
            value = value.split("(NACIONAL )").join("(NACIONAL)");
          }

          if (label) {
            const name = await window?.definesBinLabel(label);

            row[name] = value ? value : null;
          }
        }
      }

      const newRow = {
        plate: row.plate_state.split("/")[0],
        state: row.plate_state.split("/")[1].split(" ")[0],
        model_year: row.manufacture_model_year.split("/")[0],
        manufacture_year: row.manufacture_model_year.split("/")[1],
        ...row,
      };

      return newRow;
    });

    await browser.close();

    return data;
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

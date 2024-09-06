import * as puppeteer from "puppeteer";
import {
  clickButton,
  goToURL,
  hoverFieldsets,
  loadCookiesFromFile,
  saveCookiesToFile,
  typeInField,
} from "../helpers";

class ChassisService {
  async getChassis(chassi: string) {
    const browser = await puppeteer.launch();

    /**
     * Start Browser
     */
    const page = await this.openBrowser(browser);

    await this.accessVehicleStatus(chassi, page);

    const data = await this.extractDataPage(page);

    await browser.close();

    return data;
  }

  private async openBrowser(browser: puppeteer.Browser) {
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on("console", (msg) => console.log(msg.text()));

    page.on("request", async (request) => {
      const url = request.url();

      if (url.includes("https://detrannet.detran.ma.gov.br/ControleAcesso/")) {
        await page.deleteCookie();
      }

      if (
        url.includes("https://detrannet.detran.ma.gov.br/ControleAcesso/Login")
      ) {
        const cookies = await page.cookies();

        saveCookiesToFile(cookies);
      }

      request.continue();
    });

    await page.authenticate({
      username: String(process.env.DETRAN_NET_CPF),
      password: String(process.env.DETRAN_NET_PASSWORD),
    });

    loadCookiesFromFile(page);

    await goToURL(process.env.DETRAN_NET_URL, page);

    return page;
  }

  private async accessVehicleStatus(
    chassi: string,
    page: puppeteer.Page
  ): Promise<void> {
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
    await goToURL(process.env.DETRAN_NET_URL_SNG_T781, page);

    /**
     * Type in field Chassis
     */
    await typeInField("#chassi", chassi, page);

    /**
     * Click search Chassi - Button Consultar
     */
    await clickButton("#btn_C", page);
  }

  private async extractDataPage(page: puppeteer.Page): Promise<object> {
    await page.waitForSelector("#form1 > div:nth-child(5) > table");

    let document: any;

    const data = await page.evaluate(() => {
      const row = {};
      const table1 = document.querySelector(
        "#form1 > div:nth-child(5) > table"
      );

      for (let i = 1; i < table1.rows.length; i++) {
        const objCells = table1.rows.item(i).cells;

        const values = [];

        for (let j = 0; j < objCells.length; j++) {
          const text = objCells.item(j).innerHTML;

          values.push(text.trim());
        }

        const data = {
          chassis: values[0],
          vehicle_status: values[1],
          electronic_signature: values[2],
        };

        Object.assign(row, data);
      }

      return row;
    });

    return data;
  }
}

export default new ChassisService();

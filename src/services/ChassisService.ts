import * as puppeteer from "puppeteer";
import {
  clickButton,
  hoverFieldsets,
  typeInField,
  goToURL,
  loadCookiesFromFile,
  saveCookiesToFile,
} from "../helpers";

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
    await goToURL(process.env.DETRAN_NET_URL_SNG_T781, page);

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

    await page.setRequestInterception(true);

    page.on("console", (msg) => console.log(msg.text()));

    page.on("request", async (request) => {
      const url = request.url();

      if (url.includes("https://detrannet.detran.ma.gov.br")) {
        console.log(url);
      }

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
}

export default new ChassisService();

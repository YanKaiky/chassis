import * as puppeteer from "puppeteer";
import {
  clickButton,
  goToURL,
  hoverFieldsets,
  loadCookiesFromFile,
  saveCookiesToFile,
  typeInField,
  definesLabel,
} from "../helpers";

interface IDataPageProps {
  chassis_information: string;
  chassis: string;
  ident_remark: string;
  manufacture_model: string;
  state: string;
  plate: string;
  plate_state: string;
  reindeer: string;
  lien_state: string;
  vehicle_status: string;
  status_date: string;
  financed_document: string;
  financed_name: string;
  agent_code: string;
  agent_document: string;
  agent_name: string;
  contract_number: string;
  contract_date: string;
  contract_description: string;
  informant_restriction: string;
  uf_detran_update?: string | null;
  electronic_signature: string;
}

class ChassisService {
  async getChassis(chassi: string) {
    const browser = await puppeteer.launch();

    /**
     * Start Browser
     */
    const page = await this.openBrowser(browser);

    await this.accessVehicleStatus(chassi, page);

    const data = await this.extractDataPage(page, browser);

    if (!data) return null;

    return data;
  }

  private async openBrowser(browser: puppeteer.Browser) {
    const page = await browser.newPage();

    await page.exposeFunction("definesLabel", definesLabel);

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

  private async extractDataPage(
    page: puppeteer.Page,
    browser: puppeteer.Browser
  ): Promise<IDataPageProps | null> {
    await page.waitForSelector(
      "#form1 > div:nth-child(5) > table > tbody > tr > td:nth-child(1)"
    );

    let window: any;
    let document: any;

    const data = await page.evaluate(async () => {
      const renavamLabel = document.querySelector(
        "#form1 > div:nth-child(6) > table > tbody > tr:nth-child(2) > td:nth-child(2) > div"
      );

      if (renavamLabel.innerText.trim() === "Renavam") {
        const renavamNumber = renavamLabel.nextSibling.textContent.trim();

        if (renavamNumber.includes("00000000000")) return null;
      }

      const splitted = document
        .querySelector(
          "#form1 > div:nth-child(5) > table > tbody > tr > td:nth-child(1)"
        )
        .innerHTML.trim()
        .split(" ");

      const chassis = `${splitted.shift()} ${splitted.pop()}`;

      const row: any = {
        chassis_information: chassis,
      };

      const table = document.querySelector("#form1 > div:nth-child(6) > table");

      for (let i = 0; i < table.rows.length; i++) {
        const objCells = table.rows.item(i).cells;

        for (let j = 0; j < objCells.length; j++) {
          const text = objCells.item(j).innerHTML.trim();

          const labelMatch = text.match(/<div[^>]*>(.*?)<\/div>/);
          const label = labelMatch ? labelMatch[1].trim() : "";

          const value = text
            .replace(/<[^>]*>/g, "")
            .replace(label, "")
            .trim();

          if (label) {
            const name = await window?.definesLabel(label);

            row[name] = value ? value : null;
          }
        }
      }

      const newRow = {
        ...row,
        plate: row.plate_state.split("/")[0],
        state: row.plate_state.split("/")[1],
      };

      return newRow;
    });

    await browser.close();

    return data;
  }
}

export default new ChassisService();

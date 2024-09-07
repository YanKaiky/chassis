import * as puppeteer from "puppeteer";
import {
  clickButton,
  goToURL,
  hoverFieldsets,
  loadCookiesFromFile,
  saveCookiesToFile,
  typeInField,
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

  private async extractDataPage(page: puppeteer.Page): Promise<IDataPageProps> {
    await page.waitForSelector(
      "#form1 > div:nth-child(5) > table > tbody > tr > td:nth-child(1)"
    );

    let document: any;

    const data = await page.evaluate(() => {
      const splitted = document
        .querySelector(
          "#form1 > div:nth-child(5) > table > tbody > tr > td:nth-child(1)"
        )
        .innerHTML.trim()
        .split(" ");

      const chassi = `${splitted.shift()} ${splitted.pop()}`;

      const row: any = {
        chassis_information: chassi,
      };

      const definesLabel = (label: string): string => {
        const text = label.toLowerCase().split(" ").join("_");

        switch (text) {
          case "chassi":
            return "chassis";
          case "ident_remarcação":
            return "ident_remark";
          case "fabricação/modelo":
            return "manufacture_model";
          case "placa/uf":
            return "plate_state";
          case "renavam":
            return "reindeer";
          case "gravame/uf":
            return "lien_state";
          case "status_do_veículo":
            return "vehicle_status";
          case "data_status":
            return "status_date";
          case "cnpj/_cppf_financiado":
            return "financed_document";
          case "nome_financiado":
            return "financed_name";
          case "código_agente":
            return "agent_code";
          case "cnpj_agente":
            return "agent_document";
          case "nome_agente":
            return "agent_name";
          case "número_do_contrato":
            return "contract_number";
          case "data_do_contrato":
            return "contract_date";
          case "descrição_do_contrato":
            return "contract_description";
          case "informante_restrição":
            return "informant_restriction";
          case "uf_detran_atualização":
            return "uf_detran_update";
          case "assinatura_eletrônica":
            return "electronic_signature";
          default:
            return "chassis";
        }
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
            row[definesLabel(label)] = value ? value : null;
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

    return data;
  }
}

export default new ChassisService();

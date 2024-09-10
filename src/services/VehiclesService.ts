import * as puppeteer from "puppeteer";
import {
  clickButton,
  goToURL,
  hoverFieldsets,
  openBrowser,
  typeInField,
  validateCpfCnpj,
} from "../helpers";

interface IDataPageProps {
  plate: string;
  state: string;
  plate_state: string;
  chassis: string;
  brand_model: string;
  manufacture_year: string;
  color: string;
  status: string;
}

class VehiclesService {
  async getVehicles(document_number: string): Promise<IDataPageProps[] | null> {
    const validate = validateCpfCnpj(document_number);

    if (!validate) return null;

    const browser = await puppeteer.launch();

    /**
     * Start Browser
     */
    const page = await openBrowser(browser);

    await this.accessVehiclesByDocument(document_number, page);

    const data = await this.extractDataPage(page, browser);

    if (!data) return null;

    return data;
  }

  private async accessVehiclesByDocument(
    document_number: string,
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
    await clickButton("#\\32 -11 > ul > li:nth-child(3) > a", page);

    /**
     * Access URL to Tr 781 - Consulta situação veículo
     */
    await goToURL(process.env.DETRAN_NET_URL_VEHICLES, page);

    /**
     * Type in field Chassis
     */
    await typeInField("#CPFCNPJ", document_number, page);

    /**
     * Click search Chassi - Button Consultar
     */
    await clickButton("#btn_910", page);
  }

  private async extractDataPage(
    page: puppeteer.Page,
    browser: puppeteer.Browser
  ): Promise<IDataPageProps[]> {
    await page.waitForSelector(
      "#form1 > div.table-responsive.mt-3 > table > tbody > tr:nth-child(1) > td:nth-child(1)"
    );

    let window: any;
    let document: any;

    const data = await page.evaluate(async () => {
      const table = document.querySelector(
        "#form1 > div.table-responsive.mt-3 > table"
      );

      const rows = [];

      for (let i = 1; i < table.rows.length; i++) {
        const objCells = table.rows.item(i).cells;

        const content: any = {};

        for (let j = 0; j < objCells.length; j++) {
          const text = objCells.item(j).innerHTML.trim();

          const labelMatch = text.match(/<div[^>]*>(.*?)<\/div>/);
          const label = labelMatch ? labelMatch[1].trim() : "";

          let value: string = text
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .replace(label, "")
            .trim();

          if (label) {
            const name = await window?.definesVehiclesLabel(label);

            content[name] = value ? value : null;
          }
        }

        const newContent = {
          plate: content.plate_state.split("/")[0],
          state: content.plate_state.split("/")[1],
          ...content,
        };

        rows.push(newContent);
      }

      return rows;
    });

    await browser.close();

    return data;
  }
}

export default new VehiclesService();

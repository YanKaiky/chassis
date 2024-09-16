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
    console.log("🔎 Searching...");

    try {
      await page.waitForSelector(
        "#form1 > div.header.sticky-top > div.alert.alert-danger.alert-dismissible.show",
        { timeout: 3000 }
      );

      console.log("📭 There was no research.");

      await browser.close();

      return [];
    } catch (error) {}

    let selector = "#form1 > div.table-responsive.mt-3 > table";

    try {
      await page.waitForSelector(
        "#form1 > div.table-responsive.mt-3 > table > tbody > tr:nth-child(1) > td:nth-child(1)",
        { timeout: 3000 }
      );
    } catch (error) {
      selector = "#form1 > div.table-responsive > table";
    }

    let window: any;
    let document: any;

    const data = await page.evaluate(async (slctr: string) => {
      const table = document.querySelector(slctr);

      const rows = [];

      for (let i = 1; i < table.rows.length; i++) {
        const objCells = table.rows.item(i).cells;

        const content: any = {};

        for (let j = 0; j < objCells.length; j++) {
          const text = objCells.item(j).innerHTML.trim();
          let label: string = '';

          if (slctr === "#form1 > div.table-responsive.mt-3 > table") {
            const labelMatch = text.match(/<div[^>]*>(.*?)<\/div>/);

            label = labelMatch ? labelMatch[1].trim() : "";
          } else {
            switch (j) {
              case 0:
                label = "placa";
                break;
              case 1:
                label = "chassis";
                break;
              case 2:
                label = "uf";
                break;
              case 3:
                label = "marca/modelo";
                break;
              case 4:
                label = "ano_fabricação";
                break;
              default:
                break;
            }
          }

          const value: string = text
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .replace(label, "")
            .trim();

          if (label) {
            const name = await window?.definesFleetsLabel(label);

            content[name] = !value ? null : value;
          }
        }

        rows.push({
          licensePlate: content.plate
            ? content.plate
            : content?.plateState.split("/")[0],
          licensePlateState: content.state
            ? content.state
            : content?.plateState.split("/")[1],
          ...content,
        });
      }

      return rows;
    }, selector);

    console.log("🏁 Researched.");

    await browser.close();

    return data;
  }
}

export default new VehiclesService();

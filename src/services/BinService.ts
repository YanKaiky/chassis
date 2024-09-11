import * as puppeteer from "puppeteer";
import {
  clickButton,
  goToURL,
  hoverFieldsets,
  openBrowser,
  typeInField,
  checkChassis,
  checkLicensePlate,
} from "../helpers";

export enum BinTypeQuery {
  chassis = "chassis",
  plate = "plate",
  renavam = "renavam",
}

interface IDataPageProps {
  plate: string;
  state: string;
  model_year: string;
  manufacture_year: string;
  plate_state: string;
  type: string;
  species: string;
  body_type: string;
  brand_model: string;
  owner_document_number: string;
  manufacture_model_year: string;
  fuel: string;
  renavam: string;
  chassis: string;
  color: string;
  registration_city: string;
  seats: string;
  engine_number: string;
  gear_number: string | null;
  number_axles: string;
  rear_axle_number: string | null;
  axle_number_auxiliary: string | null;
  body_number: string | null;
  power: string;
  displacement: string;
  tons_load_capacity: string;
  tons_total_gross_weight: string;
  tons_maximum_traction_capacity: string;
  "1st_restriction": string | null;
  "2nd_restriction": string | null;
  "3rd_restriction": string | null;
  "4th_restriction": string | null;
  billing_uf: string;
  billing_document_number: string;
  last_update_date: string;
  indicator_renajud_restriction: string;
  description_pending_issue: string;
  description_renainf_fine: string;
  description_sale_communication: string;
  description_recall_1: string | null;
  description_recall_2: string | null;
  description_recall_3: string | null;
  description_assembler_recall: string;
  description_vehicle_category_mre: string | null;
  description_type_document_owner_indicated: string;
  document_number_ownership_indicated: string | null;
  date_last_update_mre: string | null;
  electronic_license_plate: string;
  description_origin_property: string;
  rfb_indication: string;
  tax_restriction_limit: string | null;
  vaccum_plate_indicator: string;
  restrictions_indicator: string;
  pre_registration_date: string;
}

class BinService {
  async getBin(
    key: string,
    type: string
  ): Promise<IDataPageProps | boolean | null> {
    if (type === "chassis" && !checkChassis(key)) return null;

    if (type === "plate" && !checkLicensePlate(key)) return null;

    const browser = await puppeteer.launch();

    /**
     * Start Browser
     */
    const page = await openBrowser(browser);

    await this.accessBinByType(key, type, page);

    const data = await this.extractDataPage(page, browser);

    return data;
  }

  private async accessBinByType(
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
  ): Promise<IDataPageProps | boolean | null> {
    try {
      await page.waitForSelector(
        "#form1 > div.alert.alert-danger.alert-dismissible.show",
        { timeout: 3000 }
      );

      return false;
    } catch (error) {}

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

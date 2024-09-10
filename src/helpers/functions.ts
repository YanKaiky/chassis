import * as puppeteer from "puppeteer";
import * as path from "path";
import * as fs from "fs";

const sessionsFolder = "sessions";
const cookiesFile = "cookies.json";
const cookiesPath = `${sessionsFolder}/${cookiesFile}`;

export const wait = async (ms: number): Promise<any> => {
  console.log(`Waiting for ${ms / 1000}s...`);

  return new Promise((res: any) => setTimeout(res, ms));
};

export const openBrowser = async (browser: puppeteer.Browser) => {
  const page = await browser.newPage();

  await page.exposeFunction("definesBinLabel", definesBinLabel);
  await page.exposeFunction("definesChassisLabel", definesChassisLabel);
  await page.exposeFunction("definesVehiclesLabel", definesVehiclesLabel);

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
};

export const validateCpfCnpj = (value: string): string | boolean => {
  const val: string = value.replace(/[^\w\s]/gi, "");

  if (val.length === 11) {
    return "cpf";
  } else if (val.length > 11) {
    return "cnpj";
  } else {
    return false;
  }
};

export const checkLicensePlate = (plate: string): boolean => {
  return !!plate.match(/^[a-zA-Z]{3}[0-9][A-Za-z0-9][0-9]{2}$/);
};

export const checkChassis = (chassis: string): boolean => {
  return !!chassis.match(/^[A-HJ-NPR-Z0-9]{17}$/);
};

export const goToURL = async (
  url: string | never | unknown,
  page: puppeteer.Page
): Promise<puppeteer.Page> => {
  await page.goto(String(url), {
    waitUntil: "networkidle2",
  });

  return page;
};

export const clickButton = async (
  selector: string,
  page: puppeteer.Page
): Promise<puppeteer.Page> => {
  await page.waitForSelector(selector);

  await page.click(selector);

  return page;
};

export const definesChassisLabel = (label: string): string => {
  const text = label.toString().toLowerCase().split(" ").join("_");

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
      return "financed_document_number";
    case "nome_financiado":
      return "financed_name";
    case "código_agente":
      return "agent_code";
    case "cnpj_agente":
      return "agent_document_number";
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

export const definesBinLabel = (label: string): string => {
  const text = label
    .toString()
    .replace(/:/g, "")
    .toLowerCase()
    .split(" ")
    .join("_");

  switch (text) {
    case "tipo":
      return "type";
    case "espécie":
      return "species";
    case "tipo_carroceria":
      return "body_type";
    case "marca/modelo":
      return "brand_model";
    case "cpf/cnpj_do_proprietário":
      return "owner_document_number";
    case "ano_de_fabricação/ano_modelo":
      return "manufacture_model_year";
    case "combustível":
      return "fuel";
    case "renavam":
      return "renavam";
    case "chassi":
      return "chassis";
    case "cor":
      return "color";
    case "município_de_emplacamento":
      return "registration_city";
    case "lugares":
      return "seats";
    case "número_do_motor":
      return "engine_number";
    case "número_do_cámbio":
      return "gear_number";
    case "quantidade_de_eixos":
      return "number_axles";
    case "número_do_eixo_traseiro":
      return "rear_axle_number";
    case "número_do_eixo_auxiliar":
      return "axle_number_auxiliary";
    case "número_da_carroceria":
      return "body_number";
    case "potência":
      return "power";
    case "cilindradas":
      return "displacement";
    case "capacidade_de_carga_(ton.)":
      return "tons_load_capacity";
    case "peso_bruto_total_(ton.)":
      return "tons_total_gross_weight";
    case "capacidade_máxima_de_tração_(ton.)":
      return "tons_maximum_traction_capacity";
    case "1°_restrição":
      return "1st_restriction";
    case "2°_restrição":
      return "2nd_restriction";
    case "3°_restrição":
      return "3rd_restriction";
    case "4°_restrição":
      return "4th_restriction";
    case "uf_faturamento":
      return "billing_uf";
    case "cnpj_faturamento":
      return "billing_document_number";
    case "data_ultima_atualizacao":
      return "last_update_date";
    case "indicador_restrição_renajud":
      return "indicator_renajud_restriction";
    case "descrição_pendência_de_emissão":
      return "description_pending_issue";
    case "descrição_multa_renainf":
      return "description_renainf_fine";
    case "descrição_comunicação_de_venda":
      return "description_sale_communication";
    case "descrição_recall_1":
      return "description_recall_1";
    case "descrição_recall_2":
      return "description_recall_2";
    case "descrição_recall_3":
      return "description_recall_3";
    case "descrição_recall_motadora":
      return "description_assembler_recall";
    case "descrição_da_categoria_veiculo_mre":
      return "description_vehicle_category_mre";
    case "descrição_tipo_de_documento_proprietario_indicado":
      return "description_type_document_owner_indicated";
    case "número_documento_proprietario_indicado":
      return "document_number_ownership_indicated";
    case "data_ultima_atualização_mre":
      return "date_last_update_mre";
    case "emplacamento_eletronico":
      return "electronic_license_plate";
    case "descrição_da_origem_da_propriedade":
      return "description_origin_property";
    case "indicação_rfb":
      return "rfb_indication";
    case "limite_restrição_tributaria":
      return "tax_restriction_limit";
    case "indicador_placa_vaicular":
      return "vaccum_plate_indicator";
    case "indicador_de_restrições":
      return "restrictions_indicator";
    case "data_pré-cadastro":
      return "pre_registration_date";
    default:
      return "plate_state";
  }
};

export const definesVehiclesLabel = (label: string): string => {
  const text = label
    .toString()
    .replace(/:/g, "")
    .toLowerCase()
    .split(" ")
    .join("_");

  switch (text) {
    case "placa/uf":
      return "plate_state";
    case "marca/modelo":
      return "brand_model";
    case "ano_fabricação":
      return "manufacture_year";
    case "cor":
      return "color";
    case "situação":
      return "status";
    default:
      return "chassis";
  }
};

export const hoverFieldsets = async (
  selector: string,
  page: puppeteer.Page
): Promise<puppeteer.Page> => {
  await page.waitForSelector(selector);

  await page.hover(selector);

  return page;
};

export const typeInField = async (
  selector: string,
  value: string,
  page: puppeteer.Page
): Promise<puppeteer.Page> => {
  await page.waitForSelector(selector);

  await page.type(selector, value);

  return page;
};

export const saveCookiesToFile = async (
  cookies: puppeteer.Cookie[]
): Promise<boolean> => {
  try {
    validateCookiesFileExists();

    // Writing the cookies to a file as JSON
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));

    // Cookies have been saved successfully
    return true;
  } catch (error) {
    // An error occurred while saving cookies
    console.error("Error saving cookies:", error);

    return false;
  }
};

export const loadCookiesFromFile = async (
  page: puppeteer.Page
): Promise<boolean> => {
  try {
    // Reading cookies from the specified file
    validateCookiesFileExists();

    const cookiesJson = fs.readFileSync(cookiesPath, "utf-8");

    const cookies = JSON.parse(cookiesJson);

    // Setting the cookies in the current page
    await page.setCookie(...cookies);

    // Cookies have been loaded successfully
    return true;
  } catch (error) {
    // An error occurred while loading cookies
    console.error("Error loading cookies:", error);

    return false;
  }
};

export const validateCookiesFileExists = (): void => {
  if (!fs.existsSync(sessionsFolder)) fs.mkdirSync(sessionsFolder);

  const destinationPath: string = path.join(sessionsFolder, cookiesFile);

  if (!fs.existsSync(destinationPath)) fs.writeFileSync(destinationPath, "");
};

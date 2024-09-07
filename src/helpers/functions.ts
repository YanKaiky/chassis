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


import * as puppeteer from "puppeteer";

export const wait = async (ms: number): Promise<any> => {
  console.log(`Waiting for ${ms / 1000}s...`);

  return new Promise((res: any) => setTimeout(res, ms));
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

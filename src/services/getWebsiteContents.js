import { JSDOM } from "jsdom";
import { encode, decode } from "gpt-tokenizer/model/gpt-4o";
import ReturnError from "../helper/ReturnError.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const getWebsiteContents = async (items, tokenCount) => {
	try {
		puppeteer.use(StealthPlugin());
		const browser = await puppeteer.launch();
		const results = [];

		for (const item of items) {
			const { url } = item;
			console.log("Getting content for: ", url);
			if (url === "https://consent.google.com/m") {
				continue;
			}

			const page = await browser.newPage();
			const response = await page.goto(url, { waitUntil: "networkidle2" });
			const status = response.status();
			const content = await page.evaluate(() => {
				return document.querySelector("body").innerText;
			});

			const dom = new JSDOM(content);
			const document = dom.window.document;
			const text = document.body.textContent.trim().replace(/\s+/g, " ").trim();

			let tokens = encode(text);
			tokens = tokens.slice(0, tokenCount);
			const decodedText = decode(tokens);

			results.push({
				...item,
				content: decodedText,
				status,
			});

			await page.close();
		}

		await browser.close();
		console.log(results);
		return results;
	} catch (error) {
		console.error("Error fetching website content:", error);
		throw new ReturnError("Failed to fetch website content", 500);
	}
};

export default getWebsiteContents;

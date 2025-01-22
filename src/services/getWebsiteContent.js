import { extract } from "@extractus/article-extractor";
import { JSDOM } from "jsdom";
import { encode, decode } from "gpt-tokenizer/model/gpt-4o";
import ReturnError from "../helper/ReturnError.js";

const getWebsiteContent = async (url, tokenCount) => {
	try {
		if (url === "https://consent.google.com/m") {
			return;
		}
		// extract important content from the website
		const response = await extract(url);
		const html = response.content;
		// remove html tags to save tokens
		const dom = new JSDOM(html);
		const document = dom.window.document;
		// remove extra spaces and newlines
		const text = document.body.textContent.trim().replace(/\s+/g, " ").trim();
		let tokens = encode(text);
		tokens = tokens.slice(0, tokenCount);
		const decodedText = decode(tokens);
		return decodedText;
	} catch (error) {
		console.error("Error fetching website content:", error);
		throw new ReturnError("Failed to fetch website content", 500);
	}
};

export default getWebsiteContent;

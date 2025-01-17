import { query } from "../db/index.js";
import ReturnError from "../helper/ReturnError.js";
import {
	createNewsSentimentSummaryPrompt,
	devPrompt,
} from "../prompts/newsData.js";
import generateNewsSentimentSummaryResponse from "../types/newsSentimentSummaryResponse.js";
import { encode, decode } from "gpt-tokenizer/model/gpt-4o";
import makeGNewsRequest from "./makeGNewsRequest.js";
import makeGPTRequest from "./makeGPTRequest.js";

const chunkArray = (array, chunkSize) => {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processInBatches = async (items, batchSize, delayMs, processFunction) => {
	const results = [];
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		const batchResults = await Promise.allSettled(batch.map(processFunction));
		results.push(...batchResults);
		if (i + batchSize < items.length) {
			await delay(delayMs);
		}
	}
	return results;
};

export const handleGetGNewsRequest = async (ticker, dateStart, dateEnd) => {
	try {
		const news = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3 AND news_type = 'gnews'",
			[ticker, dateStart, dateEnd]
		);
		return news;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleGetAllGNewsRequest = async (ticker) => {
	try {
		const news = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND news_type = 'gnews'",
			[ticker]
		);
		return news;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleUpdateGNewsRequest = async (
	ticker,
	dateStart,
	dateEnd,
	limit = 10
) => {
	try {
		if (limit > 100) {
			throw new ReturnError("Limit cannot exceed 100", 400);
		}
		const { data } = await makeGNewsRequest(ticker, limit, dateStart, dateEnd);
		const allArticles = data.articles;
		console.log("Ticker: ", ticker);
		console.log("Number Articles: ", allArticles.length);
		// limit article content to 600 tokens
		allArticles.forEach((article) => {
			let tokens = encode(article.content);
			tokens = tokens.slice(0, 400);
			const decodedContent = decode(tokens);
			article.content = decodedContent;
		});

		const newsChunks = chunkArray(allArticles, 5);

		const gptResponses = await Promise.allSettled(
			newsChunks.map(async (chunk) => {
				chunk.map((article) =>
					console.log("ChatGPT reading Article: ", article.title)
				);
				const gptResponse = await makeGPTRequest(
					"gpt-4o-mini",
					devPrompt,
					createNewsSentimentSummaryPrompt(
						ticker,
						chunk.map((article) => ({
							title: article.title,
							url: article.url,
							content: article.content,
						}))
					),
					generateNewsSentimentSummaryResponse()
				);
				return gptResponse.parsed["News Sentiment"];
			})
		);
		await Promise.allSettled(
			gptResponses.map(async (response) => {
				if (response.status === "fulfilled") {
					response.value
						.filter((article) => article.relevanceScore > 0.5)
						.map(async (article) => {
							console.log("Inserting article: ", article.title);
							const fullArticle = allArticles.find(
								(a) => a.url === article.url
							);
							if (!fullArticle) {
								return;
							}
							const publishedAt = fullArticle.publishedAt;
							const content = fullArticle.content;
							await query(
								"INSERT INTO sentiment_data (title, news_type, url, summary, sentiment_score, relevance_score, datetime, text, fk_company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (fk_company, url) DO NOTHING",
								[
									article.title,
									"gnews",
									article.url,
									article.summaryOfArticleContent,
									article.sentimentScore,
									article.relevanceScore,
									publishedAt,
									content,
									ticker,
								]
							);
						});
				}
			})
		);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleUpdateAllGNewsRequest = async (
	dateStart,
	dateEnd,
	limit
) => {
	try {
		const companies = await query("SELECT * FROM companies");
		const updatePromises = companies.rows.map(
			(company) => () =>
				handleUpdateGNewsRequest(company.ticker, dateStart, dateEnd, limit)
		);

		const results = await processInBatches(updatePromises, 7, 1100, (fn) =>
			fn()
		);

		const errors = results
			.filter((result) => result.status === "rejected")
			.map((result) => result.reason.message);

		const uniqueErrors = [...new Set(errors)];

		return {
			message: "GNews update completed",
			errors: uniqueErrors,
		};
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleUpdateAllGNewsRequestForYear = async (inputYear, limit) => {
	try {
		console.log("Year:", inputYear);
		const year = parseInt(inputYear, 10);
		if (isNaN(year)) {
			throw new Error(`Invalid year: ${inputYear}`);
		}

		// Construct valid dates
		const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
		const endOfYear = new Date(`${year}-12-31T23:59:59Z`);

		// Sanity-check
		console.log("Start of Year:", startOfYear);
		console.log("End of Year:  ", endOfYear);

		// Proceed with your existing logic
		const companies = await query("SELECT * FROM companies");

		const updatePromises = [];
		for (
			let day = new Date(startOfYear);
			day <= endOfYear;
			day.setDate(day.getDate() + 1)
		) {
			const dateStr = day.toISOString().split("T")[0];
			const dateStart = `${dateStr}T00:00:00Z`;
			const dateEnd = `${dateStr}T23:59:59Z`;

			for (const company of companies.rows) {
				updatePromises.push(() =>
					handleUpdateGNewsRequest(company.ticker, dateStart, dateEnd, limit)
				);
			}
		}

		const results = await processInBatches(updatePromises, 7, 1100, (fn) =>
			fn()
		);

		const errors = results
			.filter((r) => r.status === "rejected")
			.map((r) => r.reason?.message || r.reason);

		const uniqueErrors = [...new Set(errors)];

		return {
			message: "GNews update completed",
			errors: uniqueErrors,
		};
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleDeleteGNewsRequest = async (ticker, dateStart, dateEnd) => {
	try {
		await query(
			"DELETE FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3 AND news_type = 'gnews'",
			[ticker, dateStart, dateEnd]
		);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleDeleteAllGNewsRequest = async (ticker) => {
	try {
		await query(
			"DELETE FROM sentiment_data WHERE fk_company = $1 AND news_type = 'gnews'",
			[ticker]
		);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

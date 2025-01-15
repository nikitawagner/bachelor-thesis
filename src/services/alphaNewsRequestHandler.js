import { query } from "../db/index.js";
import ReturnError from "../helper/ReturnError.js";
import {
	createNewsSentimentSummaryPrompt,
	devPrompt,
} from "../prompts/newsData.js";
import generateNewsSentimentSummaryResponse from "../types/newsSentimentSummaryResponse.js";
import extractNewsDataByTicker from "../helper/extractNewsDataByTicker.js";
import makeAlphaNewsRequest from "./makeAlphaNewsRequest.js";
import makeGPTRequest from "./makeGPTRequest.js";
import getWebsiteContent from "./getWebsiteContent.js";

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

export const handleGetAlphaRequest = async (ticker, dateStart, dateEnd) => {
	try {
		const news = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3 AND news_type = 'alphavantage'",
			[ticker, dateStart, dateEnd]
		);
		return news;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleGetAllAlphaRequest = async (ticker) => {
	try {
		const news = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND news_type = 'alphavantage'",
			[ticker]
		);
		return news;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleUpdateAlphaRequest = async (
	ticker,
	dateStart,
	dateEnd,
	limit
) => {
	try {
		if (limit > 1000) {
			throw new ReturnError("Limit cannot exceed 1000", 400);
		}
		const alphaResponse = await makeAlphaNewsRequest(
			ticker,
			dateStart,
			dateEnd,
			"RELEVANCE",
			limit
		);
		const alphaData = extractNewsDataByTicker(ticker, alphaResponse).slice(
			0,
			limit
		);
		console.log("Start Getting Website Contents");
		const allArticlesResults = await Promise.allSettled(
			alphaData.map(async (article) => {
				const content = await getWebsiteContent(article.url, 400);
				return { ...article, content };
			})
		);
		console.log("Finished Getting Website Contents");
		const allArticles = allArticlesResults
			.filter((result) => result.status === "fulfilled")
			.map((result) => result.value);
		const uniqueErrors = [
			...new Set(
				allArticlesResults
					.filter((result) => result.status === "rejected")
					.map((result) => result.reason.message)
			),
		];
		console.log("Ticker: ", ticker);
		console.log("Number Articles: ", allArticles.length);
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
									"alphavantage",
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
		return {
			message: "Alpha News update completed",
			errors: uniqueErrors,
		};
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleUpdateAllAlphaRequest = async (
	dateStart,
	dateEnd,
	limit
) => {
	try {
		const companies = await query("SELECT * FROM companies");
		console.log(companies);
		const updatePromises = companies.rows.map((company) => {
			return handleUpdateAlphaRequest(company.ticker, dateStart, dateEnd, limit)
				.then((result) => ({
					status: "fulfilled",
					company: company.ticker,
					result,
				}))
				.catch((error) => ({
					status: "rejected",
					company: company.ticker,
					reason: error.message,
				}));
		});

		const results = await Promise.allSettled(updatePromises);

		const errors = results
			.filter((result) => result.status === "rejected")
			.map((result) => `Error for company ${result.company}: ${result.reason}`);

		const uniqueErrors = [...new Set(errors)];

		return {
			message: "Alpha update completed",
			errors: uniqueErrors,
		};
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleDeleteAlphaRequest = async (ticker, dateStart, dateEnd) => {
	try {
		await query(
			"DELETE FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3 AND news_type = 'alphavantage'",
			[ticker, dateStart, dateEnd]
		);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleDeleteAllAlphaRequest = async (ticker) => {
	try {
		await query(
			"DELETE FROM sentiment_data WHERE fk_company = $1 AND news_type = 'alphavantage'",
			[ticker]
		);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

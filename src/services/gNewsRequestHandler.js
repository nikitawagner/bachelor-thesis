import { query } from "../db/index.js";
import ReturnError from "../helper/ReturnError.js";
import {
	createNewsSentimentSummaryPrompt,
	devPrompt,
} from "../prompts/newsData.js";
import generateNewsSentimentSummaryResponse from "../types/newsSentimentSummaryResponse.js";
import getWebsiteContent from "./getWebsiteContent.js";
import makeGNewsRequest from "./makeGNewsRequest.js";
import makeGPTRequest from "./makeGPTRequest.js";

const chunkArray = (array, chunkSize) => {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
};

export const handleGetGNewsRequest = async (ticker, dateStart, dateEnd) => {
	try {
		const news = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3",
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
			"SELECT * FROM sentiment_data WHERE fk_company = $1",
			[ticker]
		);
		return news;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleUpdateGNewsRequest = async (ticker, dateStart, dateEnd) => {
	try {
		const { data } = await makeGNewsRequest(ticker, 10, dateStart, dateEnd);
		const allArticles = data.articles;

		const newsChunks = chunkArray(allArticles, 5);

		const gptResponses = await Promise.allSettled(
			newsChunks.map(async (chunk) => {
				chunk.map((article) => {
					console.log(
						`Gave GPT the article: ${article.title}, published at ${article.publishedAt}`
					);
				});
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
				console.log(`Chunk finished`);
				return gptResponse.parsed["News Sentiment"];
			})
		);
		await Promise.allSettled(
			gptResponses.map(async (response) => {
				if (response.status === "fulfilled") {
					response.value.map(async (article) => {
						const fullArticle = allArticles.find((a) => a.url === article.url);
						const publishedAt = fullArticle.publishedAt;
						const content = fullArticle.content;
						console.log(article);
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

export const handleDeleteGNewsRequest = async (ticker, dateStart, dateEnd) => {
	try {
		await query(
			"DELETE FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3",
			[ticker, dateStart, dateEnd]
		);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleDeleteAllGNewsRequest = async (ticker) => {
	try {
		await query("DELETE FROM sentiment_data WHERE fk_company = $1", [ticker]);
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

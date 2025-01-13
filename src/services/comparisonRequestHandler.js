import path from "path";
import { performance } from "perf_hooks";
import { createPricePrompt, devPrompt } from "../prompts/priceData.js";
import {
	createMovingAveragePrompt,
	devPrompt as technicalDevPrompt,
} from "../prompts/technicalData.js";
import { devPrompt as newsSentimentDevPrompt } from "../prompts/newsData.js";
import generatePriceDataResponse from "../types/priceDataResponse.js";
import makeGPTRequest from "./makeGPTRequest.js";
import makeAlphaPriceRequest from "./makeAlphaPriceRequest.js";
import extractAlphaDataByDate from "../helper/extractAlphaDataByDate.js";
import ensureDirectoryExists from "../helper/ensureDirectoryExists.js";
import writeToFile from "../helper/writeToFile.js";
import generateMovingAverageResponse from "../types/movingAverageResponse.js";
import makeAlphaMovingAverageRequest from "./makeAlphaMovingAverageRequest.js";
import makeAlphaNewsRequest from "./makeAlphaNewsRequest.js";
import {
	createNewsSentimentPrompt,
	createNewsSentimentSummaryPrompt,
} from "../prompts/newsData.js";
import generateNewsSentimentResponse from "../types/newsSentimentResponse.js";
import getWebsiteContent from "./getWebsiteContent.js";
import generateNewsSentimentSummaryResponse from "../types/newsSentimentSummaryResponse.js";
import extractNewsDataByTicker from "../helper/extractNewsDataByTicker.js";
import { write } from "fs";

export const handlePriceDataRequest = async (
	ticker,
	dateStart,
	dateEnd,
	model,
	baseDir
) => {
	const gptStart = performance.now();
	const gptResponse = await makeGPTRequest(
		model || "gpt-4o-mini",
		devPrompt,
		createPricePrompt(ticker, dateStart, dateEnd),
		generatePriceDataResponse()
	);
	const gptDuration = (performance.now() - gptStart) / 1000;

	const alphaStart = performance.now();
	const alphaResponse = await makeAlphaPriceRequest(
		"TIME_SERIES_DAILY",
		ticker,
		"full"
	);
	const alphaDuration = (performance.now() - alphaStart) / 1000;
	const alphaPrices = extractAlphaDataByDate(
		alphaResponse,
		dateStart,
		dateEnd,
		"Time Series (Daily)"
	);

	const outputPath = path.resolve(
		baseDir,
		`../../outputs/comparisons/${model}/price`
	);
	ensureDirectoryExists(outputPath);

	writeToFile(
		path.join(outputPath, `alpha_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${alphaDuration} seconds`,
			data: alphaPrices,
		}
	);

	writeToFile(
		path.join(outputPath, `gpt_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${gptDuration} seconds`,
			data: gptResponse.parsed["Time Series"],
		}
	);
};

export const handleMovingAverageRequest = async (
	ticker,
	dateStart,
	dateEnd,
	model,
	interval,
	timePeriod,
	seriesType,
	functionType,
	baseDir
) => {
	const gptStart = performance.now();
	const gptResponse = await makeGPTRequest(
		model || "gpt-4o-mini",
		technicalDevPrompt,
		createMovingAveragePrompt(
			functionType,
			ticker,
			dateStart,
			dateEnd,
			interval,
			timePeriod,
			seriesType
		),
		generateMovingAverageResponse()
	);
	const gptDuration = (performance.now() - gptStart) / 1000;

	const alphaStart = performance.now();
	const alphaResponse = await makeAlphaMovingAverageRequest(
		functionType,
		ticker,
		interval,
		timePeriod,
		seriesType
	);
	const alphaDuration = (performance.now() - alphaStart) / 1000;
	const alphaData = extractAlphaDataByDate(
		alphaResponse,
		dateStart,
		dateEnd,
		`Technical Analysis: ${functionType}`
	);

	const outputPath = path.resolve(
		baseDir,
		`../../outputs/comparisons/${model}/movingAverage`
	);
	ensureDirectoryExists(outputPath);

	writeToFile(
		path.join(outputPath, `alpha_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${alphaDuration} seconds`,
			data: alphaData,
		}
	);

	writeToFile(
		path.join(outputPath, `gpt_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${gptDuration} seconds`,
			data: gptResponse.parsed["Moving Average"],
		}
	);
};

export const handleNewsSentimentRequest = async (
	ticker,
	dateStart,
	dateEnd,
	model,
	sort,
	limit,
	baseDir
) => {
	const alphaStart = performance.now();
	const alphaResponse = await makeAlphaNewsRequest(
		ticker,
		dateStart,
		dateEnd,
		sort,
		limit
	);
	const alphaDuration = (performance.now() - alphaStart) / 1000;
	const alphaData = extractNewsDataByTicker(ticker, alphaResponse);

	const outputPath = path.resolve(
		baseDir,
		`../../outputs/comparisons/${model}/newsSentiment`
	);
	ensureDirectoryExists(outputPath);

	writeToFile(
		path.join(outputPath, `alpha_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${alphaDuration} seconds`,
			data: alphaData,
		}
	);
	const gptStart = performance.now();
	const gptResponse = await makeGPTRequest(
		model || "gpt-4o-mini",
		newsSentimentDevPrompt,
		createNewsSentimentPrompt(
			ticker,
			alphaData.map((article) => ({ title: article.title, url: article.url }))
		),
		generateNewsSentimentResponse()
	);
	const gptDuration = (performance.now() - gptStart) / 1000;

	writeToFile(
		path.join(outputPath, `gpt_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${gptDuration} seconds`,
			data: gptResponse.parsed["News Sentiment"],
		}
	);
};

export const handleNewsSentimentSummaryRequest = async (
	ticker,
	dateStart,
	dateEnd,
	model,
	sort,
	limit,
	baseDir
) => {
	const alphaStart = performance.now();
	const alphaResponse = await makeAlphaNewsRequest(
		ticker,
		dateStart,
		dateEnd,
		sort,
		limit
	);
	const alphaDuration = (performance.now() - alphaStart) / 1000;
	const outputPathtest = path.resolve(baseDir, `../../outputs`);
	ensureDirectoryExists(outputPathtest);

	writeToFile(path.join(outputPathtest, `alpha.json`), alphaResponse);
	const alphaData = extractNewsDataByTicker(ticker, alphaResponse).slice(
		0,
		limit
	);

	const outputPath = path.resolve(
		baseDir,
		`../../outputs/comparisons/${model}/newsSentimentSummarized`
	);
	ensureDirectoryExists(outputPath);

	writeToFile(
		path.join(outputPath, `alpha_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${alphaDuration} seconds`,
			data: alphaData,
		}
	);
	const allArticles = await Promise.all(
		alphaData.map(async (article) => {
			const content = await getWebsiteContent(article.url, 600);
			return { ...article, content };
		})
	);

	const gptStart = performance.now();
	const gptResponse = await makeGPTRequest(
		model || "gpt-4o-mini",
		newsSentimentDevPrompt,
		createNewsSentimentSummaryPrompt(
			ticker,
			allArticles.map((article) => ({
				title: article.title,
				url: article.url,
				content: article.content,
			}))
		),
		generateNewsSentimentSummaryResponse()
	);
	const gptDuration = (performance.now() - gptStart) / 1000;

	writeToFile(
		path.join(outputPath, `gpt_${ticker}_${dateStart}to${dateEnd}.json`),
		{
			duration: `${gptDuration} seconds`,
			data: gptResponse.parsed["News Sentiment"],
		}
	);
};

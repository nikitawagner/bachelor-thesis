import express from "express";
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";
import { fileURLToPath } from "url";
import makeGPTRequest from "../services/makeGPTRequest.js";
import { createPricePrompt, devPrompt } from "../prompts/priceData.js";
import ReturnError from "../helper/ReturnError.js";
import makeAlphaPriceRequest from "../services/makeAlphaPriceRequest.js";
import validateDate from "../helper/validateDate.js";
import generatePriceDataRespone from "../types/priceDataResponse.js";
import {
	createMovingAveragePrompt,
	devPrompt as technicalDevPrompt,
} from "../prompts/technicalData.js";
import {
	createNewsSentimentPrompt,
	createNewsSentimentSummaryPrompt,
	devPrompt as newsDevPrompt,
} from "../prompts/newsData.js";
import generateMovingAverageResponse from "../types/movingAverageResponse.js";
import makeAlphaMovingAverageRequest from "../services/makeAlphaMovingAverageRequest.js";
import extractAlphaDataByDate from "../helper/extractAlphaDataByDate.js";
import makeAlphaNewsRequest from "../services/makeAlphaNewsRequest.js";
import extractNewsDataByTicker from "../helper/extractNewsDataByTicker.js";
import generateNewsSentimentResponse from "../types/newsSentimentResponse.js";
import generateNewsSentimentSummaryResponse from "../types/newsSentimentSummaryResponse.js";
import getWebsiteContent from "../services/getWebsiteContent.js";
import validateRequestParams from "../helper/validateRequestParams.js";
import {
	handleMovingAverageRequest,
	handleNewsSentimentRequest,
	handleNewsSentimentSummaryRequest,
	handlePriceDataRequest,
} from "../services/comparisonRequestHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const comparisonRouter = express.Router();
comparisonRouter.get(
	"/price-data/:ticker/:dateStart/:dateEnd/:model",
	async (req, res, next) => {
		try {
			const { ticker, dateStart, dateEnd, model } = req.params;
			validateRequestParams({ ticker, dateStart, dateEnd });
			await handlePriceDataRequest(
				ticker,
				dateStart,
				dateEnd,
				model,
				__dirname
			);
			return res.status(200).json("Written Price Data successfully");
		} catch (error) {
			next(error);
		}
	}
);

comparisonRouter.get(
	"/moving-average/:symbol/:dateStart/:dateEnd/:model/:interval/:timePeriod/:seriesType/:functionType",
	async (req, res, next) => {
		const {
			symbol,
			dateStart,
			dateEnd,
			model,
			interval,
			timePeriod,
			seriesType,
			functionType,
		} = req.params;
		try {
			validateRequestParams({
				symbol,
				dateStart,
				dateEnd,
				interval,
				timePeriod,
				seriesType,
				functionType,
			});
			await handleMovingAverageRequest(
				symbol,
				dateStart,
				dateEnd,
				model,
				interval,
				timePeriod,
				seriesType,
				functionType,
				__dirname
			);
			return res.status(200).json("Written MovingAverages Successfully");
		} catch (error) {
			next(error);
		}
	}
);

comparisonRouter.get(
	"/news-sentiment/:ticker/:dateStart/:dateEnd/:model/:sort/:limit",
	async (req, res, next) => {
		try {
			const { ticker, dateStart, dateEnd, model, sort, limit } = req.params;
			validateRequestParams(
				{ ticker, dateStart, dateEnd, model, sort, limit },
				true
			);
			await handleNewsSentimentRequest(
				ticker,
				dateStart,
				dateEnd,
				model,
				sort,
				limit,
				__dirname
			);
			return res.status(200).json("Written News Sentiments Successfully");
		} catch (error) {
			next(error);
		}
	}
);

comparisonRouter.get(
	"/news-sentiment-summary/:ticker/:dateStart/:dateEnd/:model/:sort/:limit",
	async (req, res, next) => {
		const { ticker, dateStart, dateEnd, model, sort, limit } = req.params;
		try {
			validateRequestParams(
				{ ticker, dateStart, dateEnd, model, sort, limit },
				true
			);
			if (limit > 10) {
				throw new ReturnError("Limit must be less than or equal to 10", 400);
			}
			await handleNewsSentimentSummaryRequest(
				ticker,
				dateStart,
				dateEnd,
				model,
				sort,
				limit,
				__dirname
			);
			return res
				.status(200)
				.json("Written News Sentiment with Summary Successfully");
		} catch (error) {
			next(error);
		}
	}
);

export default comparisonRouter;

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ReturnError from "../helper/ReturnError.js";
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

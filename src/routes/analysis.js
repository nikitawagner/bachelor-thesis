import express from "express";
import { handlePostSingleSentimentRequest } from "../services/handleAnalysisRequests.js";

const analysisRouter = express.Router();

analysisRouter.post("/sentiment/all/:date", async (req, res, next) => {
	try {
		const { date } = req.params;
		const response = await handlePostSingleSentimentRequest(ticker, date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/sentiment/:ticker/:date", async (req, res, next) => {
	try {
		const { ticker, date } = req.params;
		const response = await handlePostSingleSentimentRequest(ticker, date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/technical/all/:date", async (req, res, next) => {
	try {
		const { ticker, date } = req.params;
		const response = await handleGetSentimentByTickerAndDate(ticker, date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/technical/:ticker/:date", async (req, res, next) => {
	try {
		const { ticker, date } = req.params;
		const response = await handleGetSentimentByTickerAndDate(ticker, date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

export default analysisRouter;

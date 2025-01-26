import express from "express";
import {
	handleGetAllSentimentalAnalysisRequest,
	handleGetSentimentAnalysisRequest,
	handlePostAllSentimentForWholeYearRequest,
	handlePostAllSentimentRequest,
	handlePostAllTechnicalForWholeYearRequest,
	handlePostAllTechnicalRequest,
	handlePostSingleSentimentRequest,
	handlePostSingleTechnicalRequest,
} from "../services/handleAnalysisRequests.js";

const analysisRouter = express.Router();

// get all sentimental analysis for actionType but all dates
analysisRouter.get("/sentiment/all/:actionType", async (req, res, next) => {
	try {
		const { actionType } = req.params;
		const response = await handleGetAllSentimentalAnalysisRequest(
			actionType.toLowerCase()
		);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

// get all sentimental analysis for actionType and specific date range
analysisRouter.get(
	"/sentiment/all/:actionType/:dateStart/:dateEnd",
	async (req, res, next) => {
		try {
			const { actionType, dateStart, dateEnd } = req.params;
			const response = await handleGetAllSentimentalAnalysisRequest(
				actionType,
				dateStart,
				dateEnd
			);
			res.json({ message: "Success", response });
		} catch (error) {
			next(error);
		}
	}
);

// get single sentimental analysis for actionType but all dates
analysisRouter.get("/sentiment/:ticker/:actionType", async (req, res, next) => {
	try {
		const { ticker, actionType } = req.params;
		const response = await handleGetSentimentAnalysisRequest(
			ticker,
			actionType.toLowerCase()
		);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

//get single setniment analysis for specific date range
analysisRouter.get(
	"/sentiment/:ticker/:actionType/:dateStart/:dateEnd",
	async (req, res, next) => {
		try {
			const { ticker, dateStart, dateEnd, actionType } = req.params;
			const response = await handleGetSentimentAnalysisRequest(
				ticker,
				actionType.toLowerCase(),
				dateStart,
				dateEnd
			);
			res.json({ message: "Success", response });
		} catch (error) {
			next(error);
		}
	}
);

// create sentimental analysis for every ticker in database for every weekday of given year
analysisRouter.post("/sentiment/full/:year", async (req, res, next) => {
	try {
		const { year } = req.params;
		const response = await handlePostAllSentimentForWholeYearRequest(year);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

// create sentimental analysis for every ticker in database for given date
analysisRouter.post("/sentiment/all/:date", async (req, res, next) => {
	try {
		const { date } = req.params;
		const response = await handlePostAllSentimentRequest(date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

// create sentimental analysis for specific ticker for given date
analysisRouter.post("/sentiment/:ticker/:date", async (req, res, next) => {
	try {
		const { ticker, date } = req.params;
		const response = await handlePostSingleSentimentRequest(ticker, date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/technical/full/:year", async (req, res, next) => {
	try {
		const { year } = req.params;
		const response = await handlePostAllTechnicalForWholeYearRequest(year);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/technical/all/:date", async (req, res, next) => {
	try {
		const { date } = req.params;
		const response = await handlePostAllTechnicalRequest(date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/technical/:ticker/:date", async (req, res, next) => {
	try {
		const { ticker, date } = req.params;
		const response = await handlePostSingleTechnicalRequest(ticker, date);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

export default analysisRouter;

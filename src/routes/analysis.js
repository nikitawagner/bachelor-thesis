import express from "express";
import {
	handleGetAllSentimentalAnalysisRequest,
	handleGetSentimentAnalysisRequest,
	handlePostSingleSentimentRequest,
} from "../services/handleAnalysisRequests.js";

const analysisRouter = express.Router();

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

// analysisRouter.post("/sentiment/all/:date", async (req, res, next) => {
// 	try {
// 		const { date } = req.params;
// 		const response = await handlePostSingleSentimentRequest(ticker, date);
// 		res.json({ message: "Success", response });
// 	} catch (error) {
// 		next(error);
// 	}
// });

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

// analysisRouter.post("/sentiment/all/:date", async (req, res, next) => {
// 	try {
// 		const { ticker, date } = req.params;
// 		const response = await handlePostSingleSentimentRequest(ticker, date);
// 		res.json({ message: "Success", response });
// 	} catch (error) {
// 		next(error);
// 	}
// });

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

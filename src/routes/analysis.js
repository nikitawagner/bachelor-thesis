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
import { query } from "../db/index.js";

const analysisRouter = express.Router();

analysisRouter.get("/get/all", async (req, res, next) => {
	try {
		const response = await query(`
			SELECT
				comp.ticker                    AS "Company",
				a.analysis_type                AS "Analysis_Type",
				actions.action_type            AS "Trade_Side",
				closeS.name                    AS "Closing_Strategy",
				price.value                    AS "Open_Price",
				ROUND( (price.value * (a.percentage / 100.0))::numeric, 2 ) 
					AS "Dollar_Gain_Loss",
				a.percentage				    AS "Percentage",
				a.result                       AS "Trade_Result",
				actions.datetime				AS "Day of Trade"
			FROM analysis a
			JOIN actions 
				ON a.fk_action = actions.id
			JOIN prices price
				ON actions.fk_price = price.id
			JOIN companies comp
				ON price.fk_company = comp.ticker
			JOIN closing_strategy closeS
				ON a.fk_closing_strategy = closeS.id
			ORDER BY a.id ASC, "Closing_Strategy" ASC`);
		const result = response.rows;
		res.json({ message: "Success", result });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/get", async (req, res, next) => {
	try {
		const {
			ticker,
			analysisType,
			actionType,
			closingStrategy,
			dateStart,
			dateEnd,
		} = req.body;
		console.log(req.body);
		const response = await query(
			`SELECT
				comp.ticker                    AS "Company",
				a.analysis_type                AS "Analysis_Type",
				actions.action_type            AS "Trade_Side",
				closeS.name                    AS "Closing_Strategy",
				price.value                    AS "Open_Price",
				ROUND( (price.value * (a.percentage / 100.0))::numeric, 2 ) 
					AS "Dollar_Gain_Loss",
				a.percentage                   AS "Percentage",
				a.result                       AS "Trade_Result",
				actions.datetime               AS "Day of Trade"
			FROM analysis a
			JOIN actions 
				ON a.fk_action = actions.id
			JOIN prices price
				ON actions.fk_price = price.id
			JOIN companies comp
				ON price.fk_company = comp.ticker
			JOIN closing_strategy closeS
				ON a.fk_closing_strategy = closeS.id
			WHERE 
				($1::TEXT IS NULL OR comp.ticker = $1::TEXT) AND
				($2::analysis_type IS NULL OR a.analysis_type = $2::analysis_type) AND
				($3::action_type IS NULL OR actions.action_type = $3::action_type) AND
				($4::TEXT IS NULL OR closeS.name = $4::TEXT) AND
				($5::DATE IS NULL OR actions.datetime >= $5::DATE) AND
				($6::DATE IS NULL OR actions.datetime <= $6::DATE)
			ORDER BY a.id ASC, "Closing_Strategy" ASC`,
			[ticker, analysisType, actionType, closingStrategy, dateStart, dateEnd]
		);
		const result = response.rows;
		res.json({ message: "Success", result });
	} catch (error) {
		next(error);
	}
});

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

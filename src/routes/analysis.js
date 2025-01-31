import express from "express";
import {
	getAnalysisData,
	handlePostAllSentimentForWholeYearRequest,
	handlePostAllSentimentRequest,
	handlePostAllTechnicalForWholeYearRequest,
	handlePostAllTechnicalRequest,
	handlePostSingleSentimentRequest,
	handlePostSingleTechnicalRequest,
} from "../services/handleAnalysisRequests.js";
import { query } from "../db/index.js";

const analysisRouter = express.Router();

analysisRouter.get("/all", async (req, res, next) => {
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
			ORDER BY a.id ASC, closeS.name  ASC`);
		const result = response.rows;
		res.json({ message: "Success", result });
	} catch (error) {
		next(error);
	}
});

analysisRouter.get("/", async (req, res, next) => {
	try {
		const {
			ticker,
			analysisType,
			actionType,
			closingStrategy,
			dateStart,
			dateEnd,
		} = req.query;

		let baseQuery = `
			SELECT
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
				JOIN actions            ON a.fk_action           = actions.id
				JOIN prices   price     ON actions.fk_price      = price.id
				JOIN companies comp     ON price.fk_company      = comp.ticker
				JOIN closing_strategy closeS
					ON a.fk_closing_strategy = closeS.id
			`;

		const conditions = [];
		const params = [];

		if (ticker) {
			params.push(ticker);
			conditions.push(`comp.ticker = $${params.length}::TEXT`);
		}

		if (analysisType) {
			params.push(analysisType);
			conditions.push(`a.analysis_type = $${params.length}::analysis_type`);
		}

		if (actionType) {
			params.push(actionType);
			conditions.push(`actions.action_type = $${params.length}::action_type`);
		}

		if (closingStrategy) {
			params.push(closingStrategy);
			conditions.push(`closeS.name = $${params.length}::TEXT`);
		}

		if (dateStart && dateEnd) {
			if (dateStart === dateEnd) {
				params.push(dateStart);
				conditions.push(`actions.datetime = $${params.length}::DATE`);
			} else {
				params.push(dateStart);
				params.push(dateEnd);
				const idxStart = params.length - 1;
				const idxEnd = params.length;
				conditions.push(
					`actions.datetime BETWEEN $${idxStart}::DATE AND $${idxEnd}::DATE`
				);
			}
		} else if (dateStart) {
			params.push(dateStart);
			conditions.push(`actions.datetime >= $${params.length}::DATE`);
		} else if (dateEnd) {
			params.push(dateEnd);
			conditions.push(`actions.datetime <= $${params.length}::DATE`);
		}

		const whereClause = conditions.length
			? `WHERE ${conditions.join(" AND ")}`
			: "";

		const finalQuery = `
			${baseQuery}
			${whereClause}
			ORDER BY a.id ASC, closeS.name ASC
			`;

		const response = await query(finalQuery, params);
		res.json({ message: "Success", result: response.rows });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/", async (req, res, next) => {
	try {
		const response = await query(`CALL apply_closing_strategies();`);
		const result = response;
		res.json({ message: "Success", result });
	} catch (error) {
		next(error);
	}
});

analysisRouter.get("/sentiment", async (req, res, next) => {
	try {
		const { ticker, actionType, dateStart, dateEnd } = req.query;
		const response = await getAnalysisData({
			analysisType: "sentiment",
			ticker,
			actionType: actionType?.toLowerCase(),
			dateStart,
			dateEnd,
		});
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.get("/technical", async (req, res, next) => {
	try {
		const { ticker, actionType, dateStart, dateEnd } = req.query;
		const response = await getAnalysisData({
			analysisType: "technical",
			ticker,
			actionType: actionType?.toLowerCase(),
			dateStart,
			dateEnd,
		});
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/sentiment/full/:year", async (req, res, next) => {
	try {
		const { year } = req.params;
		const response = await handlePostAllSentimentForWholeYearRequest(year);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

analysisRouter.post("/sentiment/all/:date", async (req, res, next) => {
	try {
		const { date } = req.params;
		const response = await handlePostAllSentimentRequest(date);
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

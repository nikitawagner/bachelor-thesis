import { query } from "../db/index.js";
import ReturnError from "../helper/ReturnError.js";
import sentimentalTools from "../helper/sentimentalTools.js";
import makeGPTToolsRequest from "./makeGPTToolsRequest.js";
import {
	createSentimentalAnalysisPrompt,
	devPrompt,
} from "../prompts/sentimentalAnalysis.js";

import generateReasoningResponse from "../types/reasoningResponse.js";
import generateWeekdaysArray from "../helper/generateWeekdaysArray.js";
import {
	createTechnicalAnalysisPrompt,
	devTechnicalPrompt,
} from "../prompts/technicalAnalysis.js";
import technicalTools from "../helper/technicalTools.js";

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

export const handlePostSingleSentimentRequest = async (ticker, date) => {
	try {
		const response = await makeGPTToolsRequest(
			"gpt-4o-mini",
			devPrompt,
			createSentimentalAnalysisPrompt(ticker, date),
			generateReasoningResponse(),
			sentimentalTools,
			ticker,
			date,
			"sentiment"
		);
		return response;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handlePostAllSentimentRequest = async (date) => {
	try {
		const { rows: companies } = await query("SELECT * FROM companies");

		const responses = await processInBatches(companies, 3, 1100, (company) =>
			makeGPTToolsRequest(
				"gpt-4o-mini",
				devPrompt,
				createSentimentalAnalysisPrompt(company.ticker, date),
				generateReasoningResponse(),
				sentimentalTools,
				company.ticker,
				date,
				"sentiment"
			)
		);
		return responses;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handlePostAllSentimentForWholeYearRequest = async (year) => {
	try {
		const results = [];
		const weekdays = generateWeekdaysArray(year);
		for (const weekday of weekdays) {
			const result = await handlePostAllSentimentRequest(weekday);
			results.push(result);
		}
		return results;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handlePostSingleTechnicalRequest = async (ticker, date) => {
	try {
		const response = await makeGPTToolsRequest(
			"gpt-4o-mini",
			devTechnicalPrompt,
			createTechnicalAnalysisPrompt(ticker, date),
			generateReasoningResponse(),
			technicalTools,
			ticker,
			date,
			"technical"
		);
		return response;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handlePostAllTechnicalRequest = async (date) => {
	try {
		const { rows: companies } = await query("SELECT * FROM companies");

		const responses = await processInBatches(companies, 3, 2000, (company) =>
			makeGPTToolsRequest(
				"gpt-4o-mini",
				devTechnicalPrompt,
				createTechnicalAnalysisPrompt(company.ticker, date),
				generateReasoningResponse(),
				technicalTools,
				company.ticker,
				date,
				"technical"
			)
		);
		return responses;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handlePostAllTechnicalForWholeYearRequest = async (year) => {
	try {
		const results = [];
		const weekdays = generateWeekdaysArray(year);
		for (const weekday of weekdays) {
			const result = await handlePostAllTechnicalRequest(weekday);
			results.push(result);
		}
		return results;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const getAnalysisData = async ({
	analysisType,
	ticker,
	actionType,
	dateStart,
	dateEnd,
}) => {
	try {
		const params = [];
		const conditions = [];

		if (ticker) {
			params.push(ticker);
			conditions.push(`p.fk_company = $${params.length}`);
		}

		if (actionType) {
			params.push(actionType);
			conditions.push(`a.action_type = $${params.length}`);
		}

		if (dateStart && dateEnd) {
			if (dateStart === dateEnd) {
				params.push(dateStart);
				conditions.push(`a.datetime = $${params.length}`);
			} else {
				params.push(dateStart, dateEnd);
				const idxStart = params.length - 1;
				const idxEnd = params.length;
				conditions.push(`a.datetime BETWEEN $${idxStart} AND $${idxEnd}`);
			}
		}

		params.push(analysisType);
		conditions.push(`a.analysis_type = $${params.length}`);

		const whereClause = conditions.length
			? `WHERE ${conditions.join(" AND ")}`
			: "";

		const dataLinkTable =
			analysisType === "technical"
				? "decisions_technical_data"
				: "decisions_sentiment_data";

		const queryText = `
      SELECT json_build_object(
        'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
        'confidence_score', ROUND(d.confidence_score::numeric, 2),
        'reasoning_summary', d.reasoning_summary,
        'action', a.action_type,
        'stop_loss', a.stop_loss,
        'take_profit', a.take_profit
      ) AS result
      FROM actions a
      JOIN prices p    ON a.fk_price = p.id
      JOIN decisions d ON a.fk_decision = d.id
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'id', x.fk_${analysisType}_data::text,
          'reasoning', x.reasoning
        )) AS reasons_array
        FROM ${dataLinkTable} x
        WHERE x.fk_decision = d.id
      ) reasons ON true
      ${whereClause}
      ORDER BY a.datetime DESC;
    `;

		const response = await query(queryText, params);
		return response.rows;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

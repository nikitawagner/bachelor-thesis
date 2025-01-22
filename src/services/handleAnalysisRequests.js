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
			date
		);
		return response;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleGetSentimentAnalysisRequest = async (
	ticker,
	actionType,
	dateStart,
	dateEnd
) => {
	try {
		if (dateStart && dateEnd && dateStart !== dateEnd) {
			const response = await query(
				`SELECT 
				json_build_object(
					'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
					'confidence_score', ROUND(d.confidence_score::numeric, 2),
					'reasoning_summary', d.reasoning_summary,
					'action', a.action_type
				) AS result
			FROM actions a
			JOIN prices p ON a.fk_price = p.id
			JOIN decisions d ON a.fk_decision = d.id
			LEFT JOIN LATERAL (
				SELECT json_agg(json_build_object(
					'id', dsd.fk_sentiment_data::text,
					'reasoning', dsd.reasoning
				)) AS reasons_array
				FROM decisions_sentiment_data dsd
				WHERE dsd.fk_decision = d.id
			) reasons ON true
			WHERE p.fk_company = $1
				AND a.action_type = $2
				AND a.datetime BETWEEN $3 AND $4
			ORDER BY a.datetime DESC;`,
				[ticker, actionType, dateStart, dateEnd]
			);
			return response.rows;
		} else if (dateStart && dateEnd && dateStart === dateEnd) {
			const response = await query(
				`SELECT 
				json_build_object(
					'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
					'confidence_score', ROUND(d.confidence_score::numeric, 2),
					'reasoning_summary', d.reasoning_summary,
					'action', a.action_type
				) AS result
			FROM actions a
			JOIN prices p ON a.fk_price = p.id
			JOIN decisions d ON a.fk_decision = d.id
			LEFT JOIN LATERAL (
				SELECT json_agg(json_build_object(
					'id', dsd.fk_sentiment_data::text,
					'reasoning', dsd.reasoning
				)) AS reasons_array
				FROM decisions_sentiment_data dsd
				WHERE dsd.fk_decision = d.id
			) reasons ON true
			WHERE p.fk_company = $1
				AND a.action_type = $2
				AND a.datetime = $3
			ORDER BY a.datetime DESC;`,
				[ticker, actionType, dateStart]
			);
			return response.rows;
		} else {
			const response = await query(
				`SELECT 
					json_build_object(
						'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
						'confidence_score', ROUND(d.confidence_score::numeric, 2),
						'reasoning_summary', d.reasoning_summary,
						'action', a.action_type
					) AS result
				FROM actions a
				JOIN prices p ON a.fk_price = p.id
				JOIN decisions d ON a.fk_decision = d.id
				LEFT JOIN LATERAL (
					SELECT json_agg(json_build_object(
						'id', dsd.fk_sentiment_data::text,
						'reasoning', dsd.reasoning
					)) AS reasons_array
					FROM decisions_sentiment_data dsd
					WHERE dsd.fk_decision = d.id
				) reasons ON true
				WHERE p.fk_company = $1
					AND a.action_type = $2
				ORDER BY a.datetime DESC;`,
				[ticker, actionType]
			);
			return response.rows;
		}
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleGetAllSentimentalAnalysisRequest = async (
	actionType,
	dateStart,
	dateEnd
) => {
	try {
		if (dateStart && dateEnd && dateStart !== dateEnd) {
			const response = await query(
				`SELECT 
				json_build_object(
					'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
					'confidence_score', ROUND(d.confidence_score::numeric, 2),
					'reasoning_summary', d.reasoning_summary,
					'action', a.action_type
				) AS result
			FROM actions a
			JOIN prices p ON a.fk_price = p.id
			JOIN decisions d ON a.fk_decision = d.id
			LEFT JOIN LATERAL (
				SELECT json_agg(json_build_object(
					'id', dsd.fk_sentiment_data::text,
					'reasoning', dsd.reasoning
				)) AS reasons_array
				FROM decisions_sentiment_data dsd
				WHERE dsd.fk_decision = d.id
			) reasons ON true
			WHERE a.action_type = $1
				AND a.datetime BETWEEN $2 AND $3
			ORDER BY a.datetime DESC;`,
				[actionType, dateStart, dateEnd]
			);
			return response.rows;
		} else if (dateStart && dateEnd && dateStart === dateEnd) {
			const response = await query(
				`SELECT 
				json_build_object(
					'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
					'confidence_score', ROUND(d.confidence_score::numeric, 2),
					'reasoning_summary', d.reasoning_summary,
					'action', a.action_type
				) AS result
			FROM actions a
			JOIN prices p ON a.fk_price = p.id
			JOIN decisions d ON a.fk_decision = d.id
			LEFT JOIN LATERAL (
				SELECT json_agg(json_build_object(
					'id', dsd.fk_sentiment_data::text,
					'reasoning', dsd.reasoning
				)) AS reasons_array
				FROM decisions_sentiment_data dsd
				WHERE dsd.fk_decision = d.id
			) reasons ON true
			WHERE a.action_type = $1
				AND a.datetime = $2
			ORDER BY a.datetime DESC;`,
				[actionType, dateStart]
			);
			return response.rows;
		} else {
			const response = await query(
				`SELECT 
					json_build_object(
						'reasons_array', COALESCE(reasons.reasons_array, '[]'::json),
						'confidence_score', ROUND(d.confidence_score::numeric, 2),
						'reasoning_summary', d.reasoning_summary,
						'action', a.action_type
					) AS result
				FROM actions a
				JOIN prices p ON a.fk_price = p.id
				JOIN decisions d ON a.fk_decision = d.id
				LEFT JOIN LATERAL (
					SELECT json_agg(json_build_object(
						'id', dsd.fk_sentiment_data::text,
						'reasoning', dsd.reasoning
					)) AS reasons_array
					FROM decisions_sentiment_data dsd
					WHERE dsd.fk_decision = d.id
				) reasons ON true
				WHERE a.action_type = $1
				ORDER BY a.datetime DESC;`,
				[actionType]
			);
			return response.rows;
		}
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
				date
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
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

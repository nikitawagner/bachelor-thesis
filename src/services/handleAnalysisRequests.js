import { query } from "../db/index.js";
import ReturnError from "../helper/ReturnError.js";
import sentimentalTools from "../helper/sentimentalTools.js";
import makeGPTToolsRequest from "./makeGPTToolsRequest.js";
import {
	createSentimentalAnalysisPrompt,
	devPrompt,
} from "../prompts/sentimentalAnalysis.js";

import generateReasoningResponse from "../types/reasoningResponse.js";

export const handlePostSingleSentimentRequest = async (ticker, date) => {
	try {
		const response = await makeGPTToolsRequest(
			"gpt-4o-mini",
			devPrompt,
			createSentimentalAnalysisPrompt(ticker, date),
			generateReasoningResponse(),
			sentimentalTools
		);
		return response.rows;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handlePostAllSentimentRequest = async (date) => {
	try {
		const { rows: companies } = await query("SELECT * FROM companies");
		const responses = await Promise.allSettled(
			companies.map((company) => {
				return makeGPTToolsRequest(
					"gpt-4o-mini",
					devPrompt,
					createSentimentalAnalysisPrompt(company.ticker, date),
					generateReasoningResponse(),
					sentimentalTools
				);
			})
		);
		return responses;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

import OpenAI from "openai";
import "dotenv/config";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import ReturnError from "../helper/ReturnError.js";
import callFunction from "../helper/callFunction.js";
import handeGPTResponse from "./handleGPTResponse.js";
import { getAllPricesByTimespan } from "./priceRequestHandler.js";
import handleGPTTechnicalResponse from "./handleGPTTechnicalResponse.js";
import { encode, decode } from "gpt-tokenizer/model/gpt-4o";
const openai = new OpenAI();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeGPTToolsRequest = async (
	model,
	devPrompt,
	userPrompt,
	responseFormat,
	tools,
	ticker,
	currentDate,
	analysisType
) => {
	console.log("Start Making GPT Request for : ", ticker);
	const providedIds = [];
	let messagesArray = [
		{ role: "developer", content: [{ type: "text", text: devPrompt }] },
		{ role: "user", content: [{ type: "text", text: userPrompt }] },
	];
	let retries = 0;

	while (retries < 3) {
		try {
			const response = await openai.beta.chat.completions.parse({
				model: model,
				messages: messagesArray,
				response_format: zodResponseFormat(responseFormat, "prompt"),
				temperature: 0,
				max_tokens: 16384,
				tools: retries < 2 ? tools : null, // Disable tools on 3rd attempt (retries=2)
			});
			const choice = response.choices[0];
			const finishReason = choice.finish_reason;

			if (finishReason === "stop") {
				const priceResponse = await getAllPricesByTimespan(
					ticker,
					null,
					"TIME_SERIES_DAILY",
					currentDate,
					currentDate
				);
				if (priceResponse.length === 0) {
					throw new ReturnError(`PriceId for ticker: ${ticker} not found`, 404);
				}
				const priceId = priceResponse.filter(
					(item) => item.price_type === "open"
				)[0].id;
				let tokens = encode(JSON.stringify(messagesArray));
				let responseTokens = encode(JSON.stringify(choice.message));
				console.log("Input Tokens: " + tokens.length);
				console.log("Output Tokens: " + responseTokens.length);

				return await handeGPTResponse(
					choice.message,
					priceId,
					currentDate,
					ticker,
					analysisType
				);
			}
			messagesArray.push(choice.message);
			if (finishReason === "tool_calls") {
				for (const toolCall of choice.message.tool_calls) {
					const args = JSON.parse(toolCall.function.arguments);
					const result = await callFunction(
						toolCall.function.name,
						args,
						currentDate,
						analysisType
					);
					result.data?.forEach((data) => {
						if (data.id) providedIds.push(data.id);
					});

					messagesArray.push({
						role: "tool",
						tool_call_id: toolCall.id,
						content: JSON.stringify(result),
					});
				}

				retries += 1;
				if (retries < 3) {
					await sleep(1100);
				}
			} else {
				throw new ReturnError(`Unexpected finish reason: ${finishReason}`, 500);
			}
		} catch (error) {
			console.error(`Attempt ${retries + 1} failed:`, error);
			if (retries === 2)
				throw new ReturnError(`Failed all Retries for ticker: ${ticker}`, 500);
			if (error.status !== 404) {
				retries += 1;
			} else {
				throw new ReturnError(`Data not found for ticker: ${ticker}`, 404);
			}
		}
	}

	throw new ReturnError(
		"Maximum attempts (3) reached without successful completion",
		500
	);
};

export default makeGPTToolsRequest;

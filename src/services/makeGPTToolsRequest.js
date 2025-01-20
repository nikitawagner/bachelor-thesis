import OpenAI from "openai";
import "dotenv/config";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import ReturnError from "../helper/ReturnError.js";
import callFunction from "../helper/callFunction.js";
const openai = new OpenAI();

const makeGPTToolsRequest = async (
	model,
	devPrompt,
	userPrompt,
	responseFormat,
	tools
) => {
	const models = ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "gpt-3.5 turbo"];
	if (models.indexOf(model) === -1) {
		throw new ReturnError(
			"Invalid model. Must be one of gpt-4o, gpt-4o-mini, o1, o1-mini, gpt-3.5 turbo",
			400
		);
	}
	if (userPrompt.length === 0) {
		throw new ReturnError("User prompt cannot be empty", 400);
	}
	const messagesArray = [
		{ role: "developer", content: [{ type: "text", text: devPrompt }] },
		{ role: "user", content: [{ type: "text", text: userPrompt }] },
	];
	let retries = 0;

	while (retries < 3) {
		try {
			console.log(messagesArray);
			const response = await openai.beta.chat.completions.parse({
				model: model,
				messages: messagesArray,
				response_format: zodResponseFormat(responseFormat, "prompt"),
				temperature: 0,
				max_tokens: 16384,
				tools: tools,
			});

			const choice = response.choices[0];
			console.log(choice);
			const finishReason = choice.finish_reason;
			const message = choice.message;

			if (finishReason === "stop") {
				return message;
			}
			messagesArray.push(message);
			if (finishReason === "tool_calls") {
				for (const toolCall of response.choices[0].message.tool_calls) {
					const args = JSON.parse(toolCall.function.arguments);

					const result = await callFunction(toolCall.function.name, args);
					messagesArray.push({
						role: "tool",
						tool_call_id: toolCall.id,
						content: JSON.stringify(result),
					});
					console.log(JSON.stringify(result));
				}
				retries += 1;
			}
		} catch (error) {
			console.log(error);
			throw new ReturnError("error", error.status);
		}
	}
};

export default makeGPTToolsRequest;

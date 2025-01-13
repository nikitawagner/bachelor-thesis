import OpenAI from "openai";
import "dotenv/config";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import ReturnError from "../helper/ReturnError.js";
const openai = new OpenAI();

const makeGPTRequest = async (model, devPrompt, userPrompt, responseFormat) => {
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
	try {
		const response = await openai.beta.chat.completions.parse({
			model: model,
			messages: [
				{ role: "developer", content: [{ type: "text", text: devPrompt }] },
				{ role: "user", content: [{ type: "text", text: userPrompt }] },
			],
			response_format: zodResponseFormat(responseFormat, "prompt"),
			temperature: 0,
		});
		return response.choices[0].message;
	} catch (error) {
		console.log(error);
		throw new ReturnError("error", error.status);
	}
};

export default makeGPTRequest;

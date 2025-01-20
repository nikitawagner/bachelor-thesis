import { OpenAI } from "openai";
import callFunction from "../helper/callFunction.js";

const openai = new OpenAI();

const tools = [
	{
		type: "function",
		function: {
			name: "get_weather",
			description: "Get current temperature for provided cityname.",
			parameters: {
				type: "object",
				properties: {
					city_name: {
						type: "string",
						description: "Name of the city, e.g. Paris",
					},
				},
				required: ["city_name"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
	{
		type: "function",
		function: {
			name: "get_condition",
			description:
				"Get current weather conditions for provided cityname e.g. Sunny.",
			parameters: {
				type: "object",
				properties: {
					city_name: {
						type: "string",
						description: "Name of the city, e.g. Paris",
					},
				},
				required: ["city_name"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

export const doFunctionCalling = async () => {
	const messagesArray = [
		{
			role: "developer",
			content: [
				{
					type: "text",
					text: "You are a chatbot that can tell the weather of cities",
				},
			],
		},
		{
			role: "user",
			content: [
				{ type: "text", text: "What is the weather like in New York?" },
			],
		},
	];
	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		tools,
		messages: messagesArray,
	});
	console.log(completion.choices[0]);
	messagesArray.push(completion.choices[0].message);
	for (const toolCall of completion.choices[0].message.tool_calls) {
		const args = JSON.parse(toolCall.function.arguments);

		const result = await callFunction(toolCall.function.name, args);
		messagesArray.push({
			role: "tool",
			tool_call_id: toolCall.id,
			content: JSON.stringify(result),
		});
		console.log(JSON.stringify(result));
	}
	const finalAnswer = await openai.chat.completions.create({
		model: "gpt-4o",
		tools,
		messages: messagesArray,
	});
	console.log(finalAnswer.choices[0]);
};

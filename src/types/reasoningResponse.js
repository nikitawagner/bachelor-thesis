import { z } from "zod";

const generateReasoningResponse = () => {
	const reasoningDataSchema = z
		.object({
			id: z
				.number()
				.describe(
					"The id of the returned data from the functions that you use for the reasoning. For example if the get_price_data function returns items with id 100, 499 or 2 and you use the data with id 499 for the reasoning, this id should be put into here"
				),
			reasoning: z
				.string()
				.describe(
					"One of the reasons that the model has for taking the action."
				),
		})
		.describe("A reasoning behind the action");
	const reasonsArray = z
		.array(reasoningDataSchema)
		.describe(
			"An array of all the reasons behind the action. Many reasons can be given but should be supported by the exact data used to make the decision."
		);
	const responseFormat = z.object({
		reasons_array: reasonsArray,
		confidence_score: z
			.number()
			._refinement((data) => data >= 0 && data <= 1)
			.describe(
				"How confident is the model that the action will return a profit as a value between 0 and 1"
			),
		reasoning_summary: z
			.string()
			.describe("A three sentence summary of the reasoning behind the action"),
		action: z
			.enum(["LONG", "SHORT", "HOLD"])
			.describe(
				"The action to take based on the reasoning. Long if buy, short if sell, hold if do nothing"
			),
		stop_loss: z
			.number()
			.optional()
			.describe(
				"The price at which the stock should be sold if the price goes down. This is a percentage of the buy price. Only use this when using technical analysis."
			),
		take_profit: z
			.number()
			.optional()
			.describe(
				"The price at which the trade should be closed. Only use this when using technical analysis."
			),
	});
	return responseFormat;
};

export default generateReasoningResponse;

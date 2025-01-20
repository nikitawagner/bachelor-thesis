import { z } from "zod";

const generateReasoningResponse = () => {
	const reasoningDataSchema = z.object({
		price: z.string(),
		reasoning: z.string(),
	});
	const timeSeriesSchema = z.array(reasoningDataSchema);
	const responseFormat = z.object({
		data: reasoningDataSchema,
	});
	return responseFormat;
};

export default generateReasoningResponse;

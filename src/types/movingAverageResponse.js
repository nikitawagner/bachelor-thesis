import { z } from "zod";

const generateMovingAverageResponse = () => {
	const movingAverageDataSchema = z.object({
		date: z.string(),
		MA: z.string(),
	});
	const timeSeriesSchema = z.array(movingAverageDataSchema);
	const priceDataResponse = z.object({
		"Moving Average": timeSeriesSchema,
	});
	return priceDataResponse;
};

export default generateMovingAverageResponse;

import { z } from "zod";

const generatePriceDataResponse = () => {
	const dailyDataSchema = z.object({
		date: z.string(),
		"1. open": z.string(),
		"2. high": z.string(),
		"3. low": z.string(),
		"4. close": z.string(),
		"5. volume": z.string(),
	});
	const timeSeriesSchema = z.array(dailyDataSchema);
	const priceDataResponse = z.object({
		"Time Series": timeSeriesSchema,
	});
	return priceDataResponse;
};

export default generatePriceDataResponse;

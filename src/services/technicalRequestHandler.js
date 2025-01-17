import alphavantageAPI from "../apis/alphavantageAPI.js";
import extractAlphaDataByDate from "../helper/extractAlphaDataByDate.js";
import ReturnError from "../helper/ReturnError.js";
import { validTicker } from "../helper/validTicker.js";

export const handleAddTechnicalRequest = async (
	ticker,
	functionType,
	dateStart,
	dateEnd,
	limit,
	timePeriod
) => {
	try {
		const allowedFunctionTypes = [
			"SMA",
			"EMA",
			"WMA",
			"DEMA",
			"TEMA",
			"STOCH",
			"RSI",
			"ADX",
			"ADXR",
			"MINUS_DI",
			"PLUS_DI",
			"MINUS_DM",
			"PLUS_DM",
			"BBANDS",
		];
		if (!allowedFunctionTypes.includes(functionType)) {
			throw new ReturnError(`Invalid function type: ${functionType}`, 400);
		}
		if (!validTicker(ticker)) {
			throw new ReturnError(`Invalid ticker: ${ticker}`, 400);
		}
		const { data, status, statusText } = await alphavantageAPI.get("", {
			params: {
				function: functionType,
				symbol: ticker,
				interval: "daily",
				time_period: timePeriod,
				series_type: "close",
			},
		});
		if (
			data["Information"] ===
			"Thank you for using Alpha Vantage! Our standard API rate limit is 25 requests per day. Please subscribe to any of the premium plans at https://www.alphavantage.co/premium/ to instantly remove all daily rate limits."
		) {
			throw new ReturnError("API Rate Limit Exceeded", 429);
		}
		const alphaDataFull = extractAlphaDataByDate(
			{ data: data },
			dateStart,
			dateEnd,
			`Technical Analysis: ${functionType}`
		);
		const alphaData = alphaDataFull.slice(0, limit);
		console.log(alphaData);

		return alphaData;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

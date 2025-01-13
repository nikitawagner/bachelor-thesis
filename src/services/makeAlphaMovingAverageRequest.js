import alphaAPI from "../apis/alphavantageAPI.js";
import ReturnError from "../helper/ReturnError.js";

const makeAlphaMovingAverageRequest = async (
	functionType,
	symbol,
	interval,
	timePeriod,
	seriesType
) => {
	const validFunctionTypes = [
		"SMA",
		"EMA",
		"WMA",
		"DEMA",
		"TEMA",
		"TRIMA",
		"KAMA",
	];
	const validIntervals = [
		"1min",
		"5min",
		"15min",
		"30min",
		"60min",
		"daily",
		"weekly",
		"monthly",
	];
	const validSeriesTypes = ["close", "open", "high", "low"];
	try {
		const symbolRegex = /^[A-Z]+$/;
		if (validFunctionTypes.indexOf(functionType) === -1) {
			throw new ReturnError(
				`Invalid functionType. ${validFunctionTypes.toString()} allowed`,
				400
			);
		}

		if (!symbolRegex.test(symbol)) {
			throw new ReturnError(
				"Invalid tickers format. Must Be IBM or IBM,AAPL etc.",
				400
			);
		}

		if (timePeriod <= 0) {
			throw new ReturnError(
				"Invalid timePeriod. Only positive integers allowed",
				400
			);
		}
		if (validIntervals.indexOf(interval) === -1) {
			throw new ReturnError(
				`Invalid interval. ${validIntervals.toString()} allowed`,
				400
			);
		}
		if (validSeriesTypes.indexOf(seriesType) === -1) {
			throw new ReturnError(
				`Invalid seriesType. ${validSeriesTypes.toString()} allowed`,
				400
			);
		}
		const { data, status, statusText } = await alphaAPI.get("", {
			params: {
				function: functionType,
				symbol: symbol,
				interval: interval,
				time_period: timePeriod,
				series_type: seriesType,
			},
		});
		return { status: status, data: data, statusText: statusText };
	} catch (error) {
		console.log(error);
		throw new ReturnError("error", error.status);
	}
};

export default makeAlphaMovingAverageRequest;

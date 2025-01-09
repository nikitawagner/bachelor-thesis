import alphaAPI from "../apis/alphavantageAPI.js";
import ReturnError from "../helper/ReturnError.js";

const makeAlphaStandardDeviation = async (symbols, range, interval) => {
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
	try {
		const symbolRegex = /^[A-Z]+$/;
		if (symbols.length > 5 || symbols.length < 1) {
			throw new ReturnError(
				"Invalid number of symbols. Must be between 1 and 5",
				400
			);
		}
		if (validIntervals.indexOf(interval) === -1) {
			throw new ReturnError(
				`Invalid interval. ${validIntervals.toString()} allowed`,
				400
			);
		}
		symbols.map((symbol) => {
			if (!symbolRegex.test(symbol)) {
				throw new ReturnError(
					`${symbol} has invalid tickers format. Must Be IBM or IBM,AAPL etc.`,
					400
				);
			}
		});
		const { data, status, statusText } = await alphaAPI.get("", {
			params: {
				function: "ANALYTICS_FIXED_WINDOW",
				SYMBOLS: symbols.join(","),
				RANGE: "3year",
				INTERVAL: interval,
				CALCULATIONS: "STDDEV(annualized=True)",
			},
		});
		console.log(data);
		return { status: status, data: data, statusText: statusText };
	} catch (error) {
		console.log(error);
		throw new ReturnError("error", error.status);
	}
};

export default makeAlphaStandardDeviation;

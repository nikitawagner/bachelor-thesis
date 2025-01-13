import alphavantageAPI from "../apis/alphavantageAPI.js";
import ReturnError from "../helper/ReturnError.js";

const makeAlphaPriceRequest = async (
	functionType,
	symbol,
	outputsize,
	interval
) => {
	try {
		const symbolRegex = /^([A-Z]+)$/;
		const functionTypes = [
			"TIME_SERIES_INTRADAY",
			"TIME_SERIES_DAILY",
			"TIME_SERIES_DAILY_ADJUSTED",
			"TIME_SERIES_WEEKLY",
			"TIME_SERIES_WEEKLY_ADJUSTED",
			"TIME_SERIES_MONTHLY",
			"TIME_SERIES_MONTHLY_ADJUSTED",
		];
		const outputsizeTypes = ["compact", "full"];

		if (!symbolRegex.test(symbol)) {
			return {
				status: 400,
				message: "Invalid symbol format. Must Be IBM or IBM,AAPL etc.",
			};
		}

		if (interval && !validInterval(interval)) {
			return {
				status: 400,
				message:
					"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
			};
		}

		if (functionTypes.indexOf(functionType) === -1) {
			return {
				status: 400,
				message:
					"Invalid function type. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_DAILY_ADJUSTED, TIME_SERIES_WEEKLY, TIME_SERIES_WEEKLY_ADJUSTED, TIME_SERIES_MONTHLY, TIME_SERIES_MONTHLY_ADJUSTED",
			};
		}

		if (outputsizeTypes.indexOf(outputsize) === -1) {
			return {
				status: 400,
				message: "Invalid outputsize. Must compact or full",
			};
		}
		const { data, status, statusText } = await alphavantageAPI.get("", {
			params: interval
				? {
						function: functionType,
						symbol: symbol,
						outputsize: outputsize,
						interval: interval,
				  }
				: {
						function: functionType,
						symbol: symbol,
						outputsize: outputsize,
				  },
		});
		return { status: status, data: data, statusText: statusText };
	} catch (error) {
		throw new ReturnError("error", error.status);
	}
};

export default makeAlphaPriceRequest;

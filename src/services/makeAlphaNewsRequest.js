import alphaAPI from "../apis/alphavantageAPI.js";
import ReturnError from "../helper/ReturnError.js";

const makeAlphaNewsRequest = async (
	tickers,
	timeStart,
	timeEnd,
	sort,
	limit
) => {
	try {
		const tickerRegex = /^([A-Z]+)(,[A-Z]+)*$/;
		const dateTimeRegex = /^\d{8}T\d{4}$/;
		if (!tickerRegex.test(tickers)) {
			throw new ReturnError(
				"Invalid tickers format. Must Be IBM or IBM,AAPL etc.",
				400
			);
		}

		if (!dateTimeRegex.test(timeStart) || !dateTimeRegex.test(timeEnd)) {
			throw new ReturnError("Invalid date format. Must be YYYYMMDDTHHMM", 400);
		}

		if (limit < 0 || limit > 1000) {
			throw new ReturnError("Invalid limit. 1 <= limit <= 1000", 400);
		}
		if (sort !== "LATEST" && sort !== "EARLIEST" && sort !== "RELEVANCE") {
			throw new ReturnError(
				"Invalid sort. LATEST, EARLIEST or RELEVANCE allowed",
				400
			);
		}

		const { data, status, statusText } = await alphaAPI.get("", {
			params: {
				function: "NEWS_SENTIMENT",
				tickers: tickers,
				time_from: timeStart,
				time_to: timeEnd,
				sort: sort,
				limit: limit,
			},
		});
		if (
			data["Information"] ===
			"Thank you for using Alpha Vantage! Our standard API rate limit is 25 requests per day. Please subscribe to any of the premium plans at https://www.alphavantage.co/premium/ to instantly remove all daily rate limits."
		) {
			throw new ReturnError("API Rate Limit Exceeded", 429);
		}
		return { status: status, data: data, statusText: statusText };
	} catch (error) {
		console.log(error);
		throw new ReturnError("error", error.status);
	}
};

export default makeAlphaNewsRequest;

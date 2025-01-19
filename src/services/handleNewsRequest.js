import { query } from "../db/index.js";
import ReturnError from "../helper/ReturnError.js";

export const handleGetNewsByTicker = async (ticker) => {
	try {
		const response = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1",
			[ticker]
		);
		return response.rows;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleGetNewsByTickerAndDate = async (
	ticker,
	dateStart,
	dateEnd
) => {
	try {
		const response = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3",
			[ticker, dateStart, dateEnd]
		);
		return response.rows;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

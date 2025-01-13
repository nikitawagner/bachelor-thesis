import gNewsAPI from "../apis/gNewsAPI.js";
import getNameByTicker from "../helper/getNameByTicker.js";
import ReturnError from "../helper/ReturnError.js";
import validGNewsDate from "../helper/validGNewsDate.js";
import { validTicker } from "../helper/validTicker.js";

const makeGNewsRequest = async (symbol, max, dateStart, dateEnd) => {
	try {
		if (!validTicker(symbol)) {
			return {
				status: 400,
				message: "Invalid symbol format. Must Be IBM or AAPL etc",
			};
		}
		if (
			dateStart &&
			dateEnd &&
			(!validGNewsDate(dateStart) || !validGNewsDate(dateEnd))
		) {
			throw new ReturnError(
				"Invalid date format. Must be YYYY-MM-DDThh:mm:ssZ",
				400
			);
		}
		const startDate = new Date(dateStart);
		const endDate = new Date(dateEnd);
		if (endDate <= startDate) {
			throw new ReturnError("End date must be after start date", 400);
		}
		const { data, status, statusText } = await gNewsAPI.get("", {
			params: {
				q: `"$${symbol}" OR ${symbol}`,
				max: max,
				lang: "en",
				from: dateStart,
				to: dateEnd,
			},
		});
		return { status: status, data: data, statusText: statusText };
	} catch (error) {
		console.log(error.response);
		throw new ReturnError(error, error.status);
	}
};

export default makeGNewsRequest;

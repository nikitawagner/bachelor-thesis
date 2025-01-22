import { query } from "../db/index.js";
import { handleGetNewsByTickerAndDate } from "../services/handleNewsRequest.js";
import { getAllPricesByTimespan } from "../services/priceRequestHandler.js";
import { handleGetTechnicalDataRequest } from "../services/technicalRequestHandler.js";

const callFunction = async (name, args) => {
	try {
		if (!name) {
			return {
				status: "ERROR",
				message: "Error calling function. Given Name not defined",
				data: null,
			};
		}
		if (name === "get_technical_data") {
			console.log(
				`called get_technical_data with args: ${JSON.stringify(args)}`
			);
			await query(
				"INSERT INTO technical_data_used (type, datetime) VALUES ($1, $2)",
				[args.functionType, new Date()]
			);
			const response = await handleGetTechnicalDataRequest(
				args.ticker,
				args.dateStart,
				args.dateEnd,
				args.functionType
			);
			return {
				status: "SUCCESS",
				message: "Function executed successfully",
				data: response,
			};
		}
		if (name === "get_news_data") {
			console.log(`called get_news_data with args: ${JSON.stringify(args)}`);
			const response = await handleGetNewsByTickerAndDate(
				args.ticker,
				args.dateStart,
				args.dateEnd
			);
			return {
				status: "SUCCESS",
				message: "Function executed successfully",
				data: response,
			};
		}
		if (name === "get_price_data") {
			console.log(`called get_price_data with args: ${JSON.stringify(args)}`);
			const response = await getAllPricesByTimespan(
				args.ticker,
				null,
				"TIME_SERIES_DAILY",
				args.dateStart,
				args.dateEnd
			);
			return {
				status: "SUCCESS",
				message: "Function executed successfully",
				data: response,
			};
		}
	} catch (error) {
		console.log(error);
		return {
			status: "ERROR",
			message: "Error calling function. Internal error",
			data: null,
		};
	}
};

export default callFunction;

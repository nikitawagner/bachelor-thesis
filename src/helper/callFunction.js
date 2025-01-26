import { query } from "../db/index.js";
import { handleGetNewsByTickerAndDate } from "../services/handleNewsRequest.js";
import { getAllPricesByTimespan } from "../services/priceRequestHandler.js";
import { handleGetTechnicalDataRequest } from "../services/technicalRequestHandler.js";

const callFunction = async (name, args, currentDate, analysisType) => {
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
				currentDate,
				args.functionType
			);
			const dataArray = response;
			const sortedData = dataArray.sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);

			const latest30 = sortedData.slice(0, 30);
			return {
				status: "SUCCESS",
				message: "Function executed successfully",
				data: latest30,
			};
		}
		if (name === "get_news_data") {
			console.log(`called get_news_data with args: ${JSON.stringify(args)}`);

			if (analysisType === "sentiment") {
				// Enforce dateEnd to be currentDate for sentiment analysis
				args.dateEnd = currentDate;

				// Calculate the day before currentDate
				const currentDateObj = new Date(currentDate);
				currentDateObj.setDate(currentDateObj.getDate() - 1);
				const dayBefore = currentDateObj.toISOString().split("T")[0];

				// Adjust dateStart to be within [dayBefore, currentDate]
				if (args.dateStart < dayBefore) {
					args.dateStart = dayBefore;
				} else if (args.dateStart > args.dateEnd) {
					args.dateStart = args.dateEnd;
				}
			}
			console.log(`changed params to: ${JSON.stringify(args)}`);
			const response = await handleGetNewsByTickerAndDate(
				args.ticker,
				args.dateStart,
				args.dateEnd
			);
			const formattedResponse = response
				.sort((a, b) => b.relevance_score - a.relevance_score)
				.slice(0, 10)
				.map((item) => ({
					id: item.id,
					title: item.title,
					summary: item.summary,
					sentiment_score: item.sentiment_score,
					relevance_score: item.relevance_score,
					datetime: item.datetime,
					fk_company: item.fk_company,
				}));
			return {
				status: "SUCCESS",
				message: "Function executed successfully",
				data: formattedResponse,
			};
		}
		if (name === "get_price_data") {
			console.log(`called get_price_data with args: ${JSON.stringify(args)}`);
			const response = await getAllPricesByTimespan(
				args.ticker,
				null,
				"TIME_SERIES_DAILY",
				args.dateStart,
				currentDate
			);
			const dataArray = response;
			const sortedData = dataArray.sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);

			const latest90 = sortedData.slice(0, 90);
			return {
				status: "SUCCESS",
				message: "Function executed successfully",
				data: latest90,
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

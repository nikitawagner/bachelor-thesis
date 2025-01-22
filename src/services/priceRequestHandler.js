import ReturnError from "../helper/ReturnError.js";
import { query } from "../db/index.js";
import makeAlphaPriceRequest from "./makeAlphaPriceRequest.js";
import { validTimeFrame } from "../helper/validTimeFrame.js";
import { validTicker } from "../helper/validTicker.js";
import { validInterval } from "../helper/validInterval.js";
import formatTimeSeriesData from "../helper/formatTimeSeriesData.js";
import { isValidDate } from "../helper/isValidDate.js";
import { getAllCompanies } from "./companyRequestHandler.js";

export const getIncludedTickers = async (interval, timeFrame) => {
	try {
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY",
				400
			);
		}
		if (timeFrame === "TIME_SERIES_INTRADAY" && !validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}
		let res;
		if (interval) {
			const queryText = `SELECT DISTINCT c.ticker
				FROM public.companies c
				INNER JOIN public.prices p 
					ON c.ticker = p.fk_company
				WHERE p.price_interval = $1 
				AND p.price_time_frame = $2`;
			res = await query(queryText, [interval, timeFrame]);
		} else {
			const queryText = `SELECT DISTINCT c.ticker
				FROM public.companies c
				INNER JOIN public.prices p 
					ON c.ticker = p.fk_company
				WHERE p.price_interval IS NULL
				AND p.price_time_frame = $1`;
			res = await query(queryText, [timeFrame]);
		}
		return res.rows.map((row) => row.ticker);
	} catch (error) {
		throw new ReturnError(error, 500);
	}
};

export const getExcludedTickers = async (interval, timeFrame) => {
	try {
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY",
				400
			);
		}
		if (timeFrame === "TIME_SERIES_INTRADAY" && !validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}
		let res;
		if (interval) {
			const queryText = `SELECT c.ticker
				FROM public.companies c
				LEFT JOIN public.prices p 
					ON c.ticker = p.fk_company 
					AND p.price_interval = $1 
					AND p.price_time_frame = $2
				WHERE p.fk_company IS NULL;`;
			res = await query(queryText, [interval, timeFrame]);
		} else {
			const queryText = `SELECT c.ticker
				FROM public.companies c
				LEFT JOIN public.prices p 
					ON c.ticker = p.fk_company 
					AND p.price_interval IS NULL 
					AND p.price_time_frame = $1
				WHERE p.fk_company IS NULL;`;
			res = await query(queryText, [timeFrame]);
		}
		return res.rows.map((row) => row.ticker);
	} catch (error) {
		throw new ReturnError(error, 500);
	}
};

export const getAllPricesByTicker = async (ticker, interval, timeFrame) => {
	try {
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY",
				400
			);
		}
		if (timeFrame === "TIME_SERIES_INTRADAY" && !validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}
		let res;
		if (interval) {
			const queryText =
				"SELECT * FROM prices WHERE fk_company = $1 and price_interval = $2 and price_time_frame = $3";
			res = await query(queryText, [ticker, interval, timeFrame]);
		} else {
			const queryText =
				"SELECT * FROM prices WHERE fk_company = $1 and price_interval IS NULL and price_time_frame = $2";
			res = await query(queryText, [ticker, timeFrame]);
		}

		return res.rows;
	} catch (error) {
		throw new ReturnError(error, 500);
	}
};

export const getAllPricesByTimespan = async (
	ticker,
	interval,
	timeFrame,
	dateStart,
	dateEnd
) => {
	try {
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY",
				400
			);
		}
		if (timeFrame === "TIME_SERIES_INTRADAY" && !validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}
		if (!isValidDate(dateStart) || !isValidDate(dateEnd)) {
			throw new ReturnError("Invalid date format. Must be YYYY-MM-DD", 400);
		}
		const startDate = new Date(dateStart);
		const endDate = new Date(dateEnd);
		if (endDate < startDate) {
			throw new ReturnError("End date must be after start date", 400);
		}
		let queryText = interval
			? `
            SELECT * FROM prices
            WHERE fk_company = $1
            AND price_interval = $2
            AND price_time_frame = $3
            AND datetime >= $4
            AND datetime <= $5
        `
			: `
            SELECT * FROM prices
            WHERE fk_company = $1
            AND price_interval IS NULL
            AND price_time_frame = $2
            AND datetime >= $3
            AND datetime <= $4
        `;
		let res;
		if (interval) {
			res = await query(queryText, [
				ticker,
				interval,
				timeFrame,
				startDate.toISOString(),
				endDate.toISOString(),
			]);
		} else {
			res = await query(queryText, [
				ticker,
				timeFrame,
				startDate.toISOString(),
				endDate.toISOString(),
			]);
		}
		return res.rows;
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

export const updatePricesForTicker = async (ticker, interval, timeFrame) => {
	try {
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY",
				400
			);
		}
		if (timeFrame === "TIME_SERIES_INTRADAY" && !validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}
		const alphaResponse = await makeAlphaPriceRequest(
			timeFrame,
			ticker,
			"full",
			interval
		);
		const prices = alphaResponse.data;
		const timeSeriesKey = Object.keys(prices).find((key) =>
			key.toLowerCase().includes("time series")
		);
		if (!timeSeriesKey) {
			throw new ReturnError("Time series data not found", 500);
		}
		const timeSeriesData = prices[timeSeriesKey];
		const formattedData = formatTimeSeriesData(
			timeSeriesData,
			interval,
			timeFrame,
			ticker
		);
		const queryText = `
            INSERT INTO prices (datetime, price_type, value, price_interval, price_time_frame, fk_company)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (fk_company, price_time_frame, price_interval, datetime, price_type)
            DO NOTHING
        `;
		const insertPromises = formattedData.map((data) => {
			return query(queryText, [
				data.datetime,
				data.price_type,
				data.value,
				data.price_interval,
				data.price_time_frame,
				data.fk_company,
			]);
		});
		await Promise.all(insertPromises);
		return { message: "Prices updated successfully" };
	} catch (error) {
		throw new ReturnError(error, 500);
	}
};

export const updateAllPricesInDatabase = async (interval, timeFrame) => {
	try {
		const companies = await getAllCompanies();
		const tickers = companies.map((company) => company.ticker);
		const updatePromises = tickers.map((ticker) =>
			updatePricesForTicker(ticker, interval, timeFrame)
		);
		const results = await Promise.allSettled(updatePromises);

		const errors = results
			.filter((result) => result.status === "rejected")
			.map((result) => result.reason.message);

		const uniqueErrors = [...new Set(errors)];

		const successfulTickers = results
			.filter((result) => result.status === "fulfilled")
			.map((result, index) => tickers[index]);

		return {
			message: "Prices update completed",
			successfulTickers,
			errors: uniqueErrors,
		};
	} catch (error) {
		throw new ReturnError(error, 500);
	}
};

export const deletePrices = async (ticker, interval, timeFrame) => {
	try {
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY",
				400
			);
		}
		if (timeFrame === "TIME_SERIES_INTRADAY" && !validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}

		if (interval) {
			const queryText =
				"DELETE FROM prices WHERE fk_company = $1 and price_interval = $2 and price_time_frame = $3 RETURNING *";
			await query(queryText, [ticker, interval, timeFrame]);
		} else {
			const queryText =
				"DELETE FROM prices WHERE fk_company = $1 and price_interval IS NULL and price_time_frame = $2 RETURNING *";
			await query(queryText, [ticker, timeFrame]);
		}
	} catch (error) {
		throw new ReturnError(error, 500);
	}
};

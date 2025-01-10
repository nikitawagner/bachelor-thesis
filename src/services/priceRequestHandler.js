import ReturnError from "../helper/ReturnError.js";
import { query } from "../db/index.js";
import makeAlphaPriceRequest from "./makeAlphaPriceRequest.js";
import { validTimeFrame } from "../helper/validTimeFrame.js";
import { validTicker } from "../helper/validTicker.js";
import { validInterval } from "../helper/validInterval.js";
import formatTimeSeriesData from "../helper/formatTimeSeriesData.js";
import { isValidDate } from "../helper/isValidDate.js";

export const getAllPricesByTicker = async (ticker, interval, timeFrame) => {
	try {
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		if (!validTimeFrame(timeFrame)) {
			console.log(validTimeFrame(timeFrame));
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
		const queryText =
			"SELECT * FROM prices WHERE fk_company = $1 and price_interval = $2 and price_time_frame = $3";
		const res = await query(queryText, [ticker, interval, timeFrame]);
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
		if (endDate <= startDate) {
			throw new ReturnError("End date must be after start date", 400);
		}
		const queryText = `
            SELECT * FROM prices
            WHERE fk_company = $1
            AND price_interval = $2
            AND price_time_frame = $3
            AND datetime >= $4
            AND datetime <= $5
        `;
		const res = await query(queryText, [
			ticker,
			interval,
			timeFrame,
			startDate.toISOString(),
			endDate.toISOString(),
		]);
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
		console.log(timeSeriesKey);
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

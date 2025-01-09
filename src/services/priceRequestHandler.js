import ReturnError from "../helper/ReturnError.js";
import { query } from "../db/index.js";
import makeAlphaPriceRequest from "./makeAlphaPriceRequest.js";
import { validTimeFrame } from "../helper/validTimeFrame.js";
import { validTicker } from "../helper/validTicker.js";

export const getAllPricesByTicker = async (ticker, interval, timeFrame) => {
	try {
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of intraday, daily, weekly, monthly",
				400
			);
		}
		if (!validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1, 5, 15, 30, 60",
				400
			);
		}
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		const queryText =
			"SELECT * FROM prices WHERE ticker = $1 and price_interval_minutes = $2 and price_time_frame = $3";
		const res = await query(queryText, [ticker, interval, timeFrame]);
		return res.rows[0];
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

export const updatePricesForTicker = async (ticker, interval, timeFrame) => {
	try {
		if (!validTimeFrame(timeFrame)) {
			throw new ReturnError(
				"Invalid time frame. Must be one of intraday, daily, weekly, monthly",
				400
			);
		}
		if (!validInterval(interval)) {
			throw new ReturnError(
				"Invalid interval. Must be one of 1min, 5min, 15min, 30min, 60min",
				400
			);
		}
		if (!validTicker(ticker)) {
			throw new ReturnError("Ticker is required", 400);
		}
		const prices = await makeAlphaPriceRequest();
		const queryText =
			"INSERT INTO companies (ticker, name, sector, volatility, size) VALUES ($1, $2, $3, $4, $5) RETURNING *";
		return await query(queryText, [ticker]);
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

export const updateCompany = async (ticker, name, sector, volatility, size) => {
	try {
		const queryText =
			"UPDATE companies SET name = $2, sector = $3, volatility = $4, size = $5 WHERE ticker = $1";
		return await query(queryText, [ticker, name, sector, volatility, size]);
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

export const deleteCompany = async (ticker) => {
	try {
		const queryText = "DELETE FROM companies WHERE ticker = $1 RETURNING *";
		return await query(queryText, [ticker]);
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

import ReturnError from "../helper/ReturnError.js";
import { query } from "../db/index.js";

export const getCompanyByTicker = async (ticker) => {
	try {
		const queryText = "SELECT * FROM companies WHERE ticker = $1";
		const res = await query(queryText, [ticker]);
		return res.rows[0];
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

export const addCompany = async (ticker, name, sector, volatility, size) => {
	try {
		const queryText =
			"INSERT INTO companies (ticker, name, sector, volatility, size) VALUES ($1, $2, $3, $4, $5) RETURNING *";
		return await query(queryText, [ticker, name, sector, volatility, size]);
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

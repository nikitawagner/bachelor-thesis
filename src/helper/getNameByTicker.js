import { query } from "../db/index.js";
import ReturnError from "./ReturnError.js";

const getNameByTicker = async (ticker) => {
	const name = await query("SELECT name FROM companies WHERE ticker = $1", [
		ticker,
	]);
	if (!name.rows[0]) {
		throw new ReturnError("Company found in Database.", 404);
	}
};

export default getNameByTicker;

import makeAlphaStandardDeviation from "../services/makeAlphaStandardDeviation.js";
import ReturnError from "./ReturnError.js";

export const returnStandardDeviation = async (symbols) => {
	try {
		if (!Array.isArray(symbols)) {
			throw new ReturnError("Symbols must be an array", 400);
		}
		const result = await makeAlphaStandardDeviation(symbols, "full", "daily");
		console.log(result.data.payload);
	} catch (error) {
		console.log(error);
		throw new ReturnError(error, 500);
	}
};

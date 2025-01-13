import ReturnError from "./ReturnError.js";
import validateDate from "./validateDate.js";

const validateRequestParams = (params, newsDateFormat) => {
	const newsDateFormatRegex = /^\d{4}\d{2}\d{2}T\d{4}$/;
	Object.entries(params).forEach(([key, value]) => {
		if (!value) {
			throw new ReturnError(`${key} is required`, 400);
		}
	});
	if (params.dateStart && !validateDate(params.dateStart) && !newsDateFormat) {
		throw new ReturnError("Start date must be in YYYY-MM-DD format", 400);
	}
	if (params.dateEnd && !validateDate(params.dateEnd) && !newsDateFormat) {
		throw new ReturnError("End date must be in YYYY-MM-DD format", 400);
	}
	if (params.dateStart && params.dateEnd && params.dateStart > params.dateEnd) {
		throw new ReturnError("Start date must be before end date", 400);
	}
	if (
		params.dateStart &&
		newsDateFormat &&
		!newsDateFormatRegex.test(params.dateStart)
	) {
		throw new ReturnError("Start date must be in YYYY-MM-DD format", 400);
	}
	if (
		params.dateEnd &&
		newsDateFormat &&
		!newsDateFormatRegex.test(params.dateEnd)
	) {
		throw new ReturnError("End date must be in YYYY-MM-DD format", 400);
	}
};

export default validateRequestParams;

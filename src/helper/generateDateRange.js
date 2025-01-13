import ReturnError from "./ReturnError.js";
import validateDate from "./validateDate.js";

function generateDateRange(dateStart, dateEnd) {
	if (!dateStart || !dateEnd) {
		throw new ReturnError("Both start and end dates are required", 400);
	}
	if (!validateDate(dateStart) || !validateDate(dateEnd)) {
		throw new ReturnError("Dates must be in the format YYYY-MM-DD", 400);
	}
	const start = new Date(dateStart);
	const end = new Date(dateEnd);
	const dates = [];

	while (start <= end) {
		const year = start.getFullYear();
		const month = String(start.getMonth() + 1).padStart(2, "0");
		const day = String(start.getDate()).padStart(2, "0");

		dates.push(`${year}-${month}-${day}`);
		start.setDate(start.getDate() + 1);
	}
	return dates;
}

export default generateDateRange;

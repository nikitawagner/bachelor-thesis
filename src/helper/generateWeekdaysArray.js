const generateWeekdaysArray = (year, monthStart, monthEnd) => {
	const numericYear = Number(year);

	monthStart = Math.max(monthStart, 1);

	const weekdays = [];
	let currentDate = new Date(numericYear, monthStart, 1);

	while (
		currentDate.getFullYear() === numericYear &&
		currentDate.getMonth() <= monthEnd
	) {
		const dayOfWeek = currentDate.getDay();
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			const month = String(currentDate.getMonth() + 1).padStart(2, "0");
			const day = String(currentDate.getDate()).padStart(2, "0");
			weekdays.push(`${numericYear}-${month}-${day}`);
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return weekdays;
};

export default generateWeekdaysArray;

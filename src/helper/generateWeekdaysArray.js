const generateWeekdaysArray = (year) => {
	const numericYear = Number(year);

	const weekdays = [];
	let currentDate = new Date(numericYear, 0, 1);

	while (currentDate.getFullYear() === numericYear) {
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

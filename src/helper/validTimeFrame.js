export const validTimeFrame = (timeFrame) => {
	const validTimeFrames = [
		"TIME_SERIES_INTRADAY",
		"TIME_SERIES_DAILY",
		"TIME_SERIES_WEEKLY",
		"TIME_SERIES_MONTHLY",
	];
	return validTimeFrames.indexOf(timeFrame) !== -1;
};

export const validTimeFrame = (timeFrame) => {
	const validTimeFrames = ["intraday", "daily", "weekly", "monthly"];
	validTimeFrames.indexOf(timeFrame) !== -1;
};

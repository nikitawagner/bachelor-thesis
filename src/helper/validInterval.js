export const validInterval = (interval) => {
	const intervalTypes = ["1min", "5min", "15min", "30min", "60min"];
	return intervalTypes.indexOf(interval) !== -1;
};

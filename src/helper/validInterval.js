const validInterval = (interval) => {
	const intervalTypes = ["1", "5", "15", "30", "60"];
	return intervalTypes.indexOf(interval) !== -1;
};

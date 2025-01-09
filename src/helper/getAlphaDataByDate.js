const getAlphaDataByDate = (dateStart, dateEnd, alphaTimeSeriesData) => {
	const startDate = new Date(dateStart);
	const endDate = new Date(dateEnd);

	const filteredData = alphaTimeSeriesData.filter((data) => {
		const currentDate = new Date(data.date);
		return currentDate >= startDate && currentDate <= endDate;
	});
	const sortedData = filteredData.sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	return sortedData;
};

export default getAlphaDataByDate;

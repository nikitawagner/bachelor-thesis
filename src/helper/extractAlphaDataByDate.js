import getAlphaDataByDate from "./getAlphaDataByDate.js";

const extractAlphaDataByDate = (data, dateStart, dateEnd, dataKey) => {
	const alphaTimeSeriesData = data.data[dataKey];
	const alphaTimeSeriesArray = Object.entries(alphaTimeSeriesData).map(
		([date, data]) => ({
			date,
			...data,
		})
	);
	return getAlphaDataByDate(dateStart, dateEnd, alphaTimeSeriesArray);
};

export default extractAlphaDataByDate;

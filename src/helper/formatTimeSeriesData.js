const formatTimeSeriesData = (timeSeriesData, interval, timeFrame, ticker) => {
	const formattedData = [];

	Object.entries(timeSeriesData).forEach(([datetime, prices]) => {
		const formattedDatetime = new Date(datetime).toISOString(); // Format datetime to PostgreSQL timestamp format

		Object.entries(prices).forEach(([priceType, value]) => {
			const priceTypeMap = {
				"1. open": "open",
				"2. high": "high",
				"3. low": "low",
				"4. close": "close",
				"5. volume": "volume",
			};

			formattedData.push({
				datetime: formattedDatetime,
				price_type: priceTypeMap[priceType],
				value: parseFloat(value), // Convert value to a number
				price_interval: interval,
				price_time_frame: timeFrame,
				fk_company: ticker,
			});
		});
	});

	return formattedData;
};

export default formatTimeSeriesData;

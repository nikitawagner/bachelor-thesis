export const devPrompt =
	"You are a financial expert that knows all technical data of a stock when the symbol is given to you.";

export const createMovingAveragePrompt = (
	functionType,
	symbol,
	startDate,
	endDate,
	interval,
	timePeriod,
	seriesType
) => {
	return `Return the Moving Average ${functionType} Values of: '${symbol}' from the ${startDate} to the ${endDate} with a ${interval} interval where ${timePeriod} data points are used to calculate each moving average. 
	Use the ${seriesType} price and only start on fridays but end on the last specified date. All Prices are in US Dollar.`;
};

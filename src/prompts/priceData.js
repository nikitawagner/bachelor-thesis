export const devPrompt =
	"You are a financial expert that knows all stock prices of a stock when the symbol is given to you.";

export const createPricePrompt = (symbol, startDate, endDate) => {
	return `What are the daily 1. open, 2. high, 3. low, 4. close, and 5. volume prices of the stock: '${symbol}' from the ${startDate} to the ${endDate} in US Dollar? 
	Be as precise as possible and only use valid and accurate data.`;
};

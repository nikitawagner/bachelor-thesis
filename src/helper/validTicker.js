export const validTicker = (ticker) => {
	const symbolRegex = /^[A-Z]+$/;
	return symbolRegex.test(ticker);
};

export const validTickersString = (tickers) => {
	const symbolRegex = /^([A-Z]+)(,[A-Z]+)*$/;
	return symbolRegex.test(tickers);
};

const extractNewsDataByTicker = (ticker, inputData) => {
	const data = inputData.data;
	if (!data || !data.feed) {
		return [];
	}
	return data.feed
		.filter((newsItem) => !newsItem.url.includes(".google.com"))
		.map((newsItem) => {
			const filteredTickerSentiment = newsItem.ticker_sentiment.filter(
				(ts) => ts.ticker === ticker
			);

			return {
				title: newsItem.title,
				url: newsItem.url,
				summary: newsItem.summary,
				sentimentScore: filteredTickerSentiment[0].ticker_sentiment_score,
				relvanceScore: filteredTickerSentiment[0].relevance_score,
			};
		});
};

export default extractNewsDataByTicker;

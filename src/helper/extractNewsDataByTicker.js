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
			const timePublished = newsItem.time_published;
			const formattedTimePublished = `${timePublished.slice(
				0,
				4
			)}-${timePublished.slice(4, 6)}-${timePublished.slice(
				6,
				8
			)} ${timePublished.slice(9, 11)}:${timePublished.slice(
				11,
				13
			)}:${timePublished.slice(13, 15)}`;
			return {
				title: newsItem.title,
				url: newsItem.url,
				summary: newsItem.summary,
				publishedAt: formattedTimePublished,
				sentimentScore: filteredTickerSentiment[0].ticker_sentiment_score,
				relvanceScore: filteredTickerSentiment[0].relevance_score,
			};
		});
};

export default extractNewsDataByTicker;

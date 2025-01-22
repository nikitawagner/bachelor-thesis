const sentimentalTools = [
	{
		type: "function",
		function: {
			name: "get_news_data",
			description:
				"Get news articles with title, urls, summary, sentiment_score, relevance_score, when it was published and its contents for the given ticker. The relevance_score (0 to 1) means how much the news article is related to the stock. The sentiment_score (-1 to 1) means how positive or negative the news article is. This data should be used for sentimental analysis.",
			parameters: {
				type: "object",
				properties: {
					ticker: {
						type: "string",
						description: "Ticker of the stock e.g. AAPL",
					},
					dateStart: {
						type: "string",
						description:
							"Start date of the asked news data in format 2024-04-10",
					},
					dateEnd: {
						type: "string",
						description: "End date of the asked news data in format 2024-04-19",
					},
				},
				required: ["ticker", "dateStart", "dateEnd"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

export default sentimentalTools;

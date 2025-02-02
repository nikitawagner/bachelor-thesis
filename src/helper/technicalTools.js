const technicalTools = [
	{
		type: "function",
		function: {
			name: "get_price_data",
			description:
				"Get opening, closing, high, low price data for the given ticker. This data should be used for both sentimental and technical analysis",
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
							"Start date of the asked price data in format 2024-04-10",
					},
					dateEnd: {
						type: "string",
						description:
							"End date of the asked price data in format 2024-04-10",
					},
				},
				required: ["ticker", "dateStart", "dateEnd"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
	{
		type: "function",
		function: {
			name: "get_technical_data",
			description:
				"Get technical data of the asked stock like Moving Averages, Bollinger Bands. This data should be used for technical analysis. Also a combination of different data can be used for better results.",
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
					functionType: {
						type: "string",
						enum: [
							"SMA",
							"EMA",
							"BBANDS",
							"ADX",
							"ADXR",
							"PLUS_DI",
							"MINUS_DI",
							"PLUS_DM",
							"MINUS_DM",
							"RSI",
							"STOCH",
						],
						description: "Type of the technical data of the given ticker.",
					},
				},
				required: ["ticker", "dateStart", "dateEnd", "functionType"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

export default technicalTools;

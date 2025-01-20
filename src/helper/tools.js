const tools = [
	{
		type: "function",
		function: {
			name: "get_price_data",
			description:
				"Get opening, closing, high, low price data for the given ticker.",
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
];

export default tools;

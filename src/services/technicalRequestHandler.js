import alphavantageAPI from "../apis/alphavantageAPI.js";
import { query } from "../db/index.js";
import extractAlphaDataByDate from "../helper/extractAlphaDataByDate.js";
import ReturnError from "../helper/ReturnError.js";
import { validTicker } from "../helper/validTicker.js";

export const handleAddTechnicalRequest = async (
	ticker,
	functionType,
	dateStart,
	dateEnd,
	limit,
	timePeriod
) => {
	try {
		const allowedFunctionTypes = [
			"SMA",
			"EMA",
			"WMA",
			"DEMA",
			"TEMA",
			"STOCH",
			"RSI",
			"ADX",
			"ADXR",
			"MINUS_DI",
			"PLUS_DI",
			"MINUS_DM",
			"PLUS_DM",
			"BBANDS",
		];
		if (!allowedFunctionTypes.includes(functionType)) {
			throw new ReturnError(`Invalid function type: ${functionType}`, 400);
		}
		if (!validTicker(ticker)) {
			throw new ReturnError(`Invalid ticker: ${ticker}`, 400);
		}
		const { data, status, statusText } = await alphavantageAPI.get("", {
			params: {
				function: functionType,
				symbol: ticker,
				interval: "daily",
				time_period: timePeriod,
				series_type: "close",
			},
		});
		if (
			data["Information"] ===
			"Thank you for using Alpha Vantage! Our standard API rate limit is 25 requests per day. Please subscribe to any of the premium plans at https://www.alphavantage.co/premium/ to instantly remove all daily rate limits."
		) {
			throw new ReturnError("API Rate Limit Exceeded", 429);
		}
		const alphaDataFull = extractAlphaDataByDate(
			{ data: data },
			dateStart,
			dateEnd,
			`Technical Analysis: ${functionType}`
		);
		const alphaData = alphaDataFull.slice(0, limit);
		const subtypeKeys = [
			...new Set(
				dataArray.flatMap((obj) => Object.keys(obj).filter((k) => k !== "date"))
			),
		]
			.map((key) => `'${key}'`) // Format for SQL IN clause
			.join(", ");

		const subtypeQuery = `
        SELECT id, sub_type
        FROM technical_data_types_subtypes
        WHERE sub_type IN (${subtypeKeys})
        `;
		const { rows: subtypeRows } = await query(subtypeQuery);
		const subtypeMap = Object.fromEntries(
			subtypeRows.map((row) => [row.sub_type, row.id])
		);
		const insertPromises = dataArray.map(async (entry) => {
			const datetime = entry.date;
			const techDataResult = await query(
				`INSERT INTO technical_data (fk_type, fk_company, datetime)
         VALUES ($1, $2, $3) RETURNING id`,
				[fk_type, ticker, datetime]
			);

			const technicalDataId = techDataResult.rows[0].id;
			const valueInsertPromises = Object.entries(entry)
				.filter(([key]) => key !== "date")
				.map(([key, value]) => {
					const fk_subtype = subtypeMap[key];
					if (!fk_subtype) return Promise.resolve();

					return query(
						`INSERT INTO technical_data_subtypes_values (fk_technical_data_entry, fk_subtype, value)
             VALUES ($1, $2, $3)`,
						[technicalDataId, fk_subtype, value]
					);
				});

			return Promise.allSettled(valueInsertPromises);
		});
		return alphaData;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const tester = async () => {
	const dataArray = [
		{
			date: "2024-12-02",
			"Real Upper Band": "237.6719",
			"Real Middle Band": "227.7405",
			"Real Lower Band": "217.8091",
		},
		{
			date: "2024-12-03",
			"Real Upper Band": "238.5749",
			"Real Middle Band": "228.1069",
			"Real Lower Band": "217.6388",
		},
		{
			date: "2024-12-04",
			"Real Upper Band": "239.4135",
			"Real Middle Band": "228.4926",
			"Real Lower Band": "217.5717",
		},
		{
			date: "2024-12-05",
			"Real Upper Band": "240.2573",
			"Real Middle Band": "228.8363",
			"Real Lower Band": "217.4153",
		},
		{
			date: "2024-12-06",
			"Real Upper Band": "241.0239",
			"Real Middle Band": "229.1749",
			"Real Lower Band": "217.3259",
		},
		{
			date: "2024-12-09",
			"Real Upper Band": "242.1184",
			"Real Middle Band": "229.5832",
			"Real Lower Band": "217.0479",
		},
		{
			date: "2024-12-10",
			"Real Upper Band": "242.9921",
			"Real Middle Band": "230.1113",
			"Real Lower Band": "217.2305",
		},
		{
			date: "2024-12-11",
			"Real Upper Band": "243.6696",
			"Real Middle Band": "230.6103",
			"Real Lower Band": "217.5509",
		},
		{
			date: "2024-12-12",
			"Real Upper Band": "244.5924",
			"Real Middle Band": "231.0688",
			"Real Lower Band": "217.5453",
		},
		{
			date: "2024-12-13",
			"Real Upper Band": "245.5880",
			"Real Middle Band": "231.3940",
			"Real Lower Band": "217.2000",
		},
		{
			date: "2024-12-16",
			"Real Upper Band": "246.8060",
			"Real Middle Band": "231.7789",
			"Real Lower Band": "216.7517",
		},
		{
			date: "2024-12-17",
			"Real Upper Band": "248.1808",
			"Real Middle Band": "232.2332",
			"Real Lower Band": "216.2855",
		},
		{
			date: "2024-12-18",
			"Real Upper Band": "248.9764",
			"Real Middle Band": "232.5820",
			"Real Lower Band": "216.1877",
		},
		{
			date: "2024-12-19",
			"Real Upper Band": "249.8617",
			"Real Middle Band": "232.9765",
			"Real Lower Band": "216.0913",
		},
		{
			date: "2024-12-20",
			"Real Upper Band": "251.1212",
			"Real Middle Band": "233.4302",
			"Real Lower Band": "215.7392",
		},
		{
			date: "2024-12-23",
			"Real Upper Band": "252.3748",
			"Real Middle Band": "233.8923",
			"Real Lower Band": "215.4099",
		},
		{
			date: "2024-12-24",
			"Real Upper Band": "253.8150",
			"Real Middle Band": "234.3166",
			"Real Lower Band": "214.8183",
		},
		{
			date: "2024-12-26",
			"Real Upper Band": "255.2392",
			"Real Middle Band": "234.8676",
			"Real Lower Band": "214.4961",
		},
		{
			date: "2024-12-27",
			"Real Upper Band": "256.2817",
			"Real Middle Band": "235.3519",
			"Real Lower Band": "214.4221",
		},
		{
			date: "2024-12-30",
			"Real Upper Band": "257.0022",
			"Real Middle Band": "235.7982",
			"Real Lower Band": "214.5942",
		},
		{
			date: "2024-12-31",
			"Real Upper Band": "257.5860",
			"Real Middle Band": "236.1961",
			"Real Lower Band": "214.8062",
		},
	];
	const fk_type = "BBANDS";
	const fk_company = "AAPL";
	const subtypeKeys = [
		...new Set(
			dataArray.flatMap((obj) => Object.keys(obj).filter((k) => k !== "date"))
		),
	]
		.map((key) => `'${key}'`) // Format for SQL IN clause
		.join(", ");

	const subtypeQuery = `
        SELECT id, sub_type
        FROM technical_data_types_subtypes
        WHERE sub_type IN (${subtypeKeys})
        `;
	console.log(subtypeQuery);
	const { rows: subtypeRows } = await query(subtypeQuery);
	console.log(subtypeRows);
	const subtypeMap = Object.fromEntries(
		subtypeRows.map((row) => [row.sub_type, row.id])
	);
	console.log(subtypeMap);
	const insertPromises = dataArray.map(async (entry) => {
		const datetime = entry.date;
		const techDataResult = await query(
			`INSERT INTO technical_data (fk_type, fk_company, datetime)
         VALUES ($1, $2, $3) RETURNING id`,
			[fk_type, fk_company, datetime]
		);

		const technicalDataId = techDataResult.rows[0].id;
		const valueInsertPromises = Object.entries(entry)
			.filter(([key]) => key !== "date")
			.map(([key, value]) => {
				const fk_subtype = subtypeMap[key];
				if (!fk_subtype) return Promise.resolve();

				return query(
					`INSERT INTO technical_data_subtypes_values (fk_technical_data_entry, fk_subtype, value)
             VALUES ($1, $2, $3)`,
					[technicalDataId, fk_subtype, value]
				);
			});

		return Promise.allSettled(valueInsertPromises);
	});
	await Promise.allSettled(insertPromises);
};

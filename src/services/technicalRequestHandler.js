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
			//"WMA",
			//"DEMA",
			//"TEMA",
			//"STOCH",
			"RSI",
			"ADX",
			"ADXR",
			//"MINUS_DI",
			//"PLUS_DI",
			//"MINUS_DM",
			//"PLUS_DM",
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
				alphaData.flatMap((obj) => Object.keys(obj).filter((k) => k !== "date"))
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
		const insertPromises = alphaData.map(async (entry) => {
			const datetime = entry.date;
			const techDataResult = await query(
				`INSERT INTO technical_data (fk_type, fk_company, datetime)
         			VALUES ($1, $2, $3) RETURNING id`,
				[functionType, ticker, datetime]
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
		return alphaData;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export const handleGetTechnicalDataRequest = async (
	ticker,
	dateStart,
	dateEnd,
	functionType
) => {
	try {
		const queryText = `
			WITH formatted_data AS (
				SELECT
					td.id as id,
					td.datetime AS date,
					JSON_OBJECT_AGG(DISTINCT tdt.sub_type, tdsv.value) AS values
				FROM
					technical_data td
				JOIN
					technical_data_subtypes_values tdsv
					ON td.id = tdsv.fk_technical_data_entry
				JOIN
					technical_data_types_subtypes tdt
					ON tdsv.fk_subtype = tdt.id
				WHERE
					td.datetime BETWEEN $1 AND $2
					AND td.fk_company = (
						SELECT c.ticker FROM companies c WHERE c.ticker = $3
					)
					AND td.fk_type = (
						SELECT tdtp.short FROM technical_data_types tdtp WHERE tdtp.short = $4
					)
				GROUP BY
					td.id, td.datetime
				ORDER BY
					td.datetime
			)
			SELECT
				JSON_AGG(
					JSON_BUILD_OBJECT(
						'id', id,
						'date', date,
						'values', values
					)
				) AS result
			FROM
				formatted_data;
			`;
		const response = await query(queryText, [
			dateStart,
			dateEnd,
			ticker,
			functionType,
		]);
		return response.rows[0].result;
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

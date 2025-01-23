import { query } from "../db/index.js";

const handeGPTResponse = async (
	rawResponse,
	price,
	datetime,
	ticker,
	analysisType
) => {
	const response = rawResponse.parsed;
	const reasonsArray = response.reasons_array;
	const confidence_score = response.confidence_score;
	const action = response.action;
	const reasoning_summary = response.reasoning_summary;
	const stop_loss = response.stop_loss;
	const take_profit = response.take_profit;
	try {
		console.log(`Start handling GPT Response for: ${ticker}`);
		await query("BEGIN");
		console.log(`Insert Decision for ${ticker}`);
		const decisionInsert = `
            INSERT INTO decisions (reasoning_summary, confidence_score)
            VALUES ($1, $2)
            RETURNING id;
        `;
		const decisionResult = await query(decisionInsert, [
			reasoning_summary,
			confidence_score,
		]);
		const decisionId = decisionResult.rows[0].id;
		if (reasonsArray.length > 0) {
			const cleanedReasonsArray = reasonsArray
				.filter((reason) => !isNaN(Number(reason.id)))
				.map((reason) => ({
					id: Number(reason.id),
					reasoning: reason.reasoning,
				}));
			const reasonIds = cleanedReasonsArray.map((r) => Number(r.id));
			const { rows: existingIds } = await query(
				analysisType === "sentiment"
					? `SELECT id FROM sentiment_data WHERE id = ANY($1)`
					: `SELECT id FROM technical_data WHERE id = ANY($1)`,
				[reasonIds]
			);
			const validIds = new Set(existingIds.map((row) => row.id.toString()));
			const validReasons = cleanedReasonsArray.filter((reason) =>
				validIds.has(reason.id.toString())
			);
			console.log(`Start Inserting Sentiment for ${ticker}`);
			for (const reason of validReasons) {
				const sentimentInsert = `
                INSERT INTO decisions_sentiment_data (fk_sentiment_data, fk_decision, reasoning)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING;
				`;
				const technicalInsert = `
                INSERT INTO decisions_technical_data (fk_technical_data, fk_decision, reasoning)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING;
				`;
				await query(
					analysisType === "sentiment" ? sentimentInsert : technicalInsert,
					[reason.id, decisionId, reason.reasoning]
				);
			}
		}
		console.log(`Insert Action for ${ticker}`);
		const actionInsert =
			analysisType === "sentiment"
				? `
            INSERT INTO actions (action_type, fk_price, fk_decision, datetime)
            VALUES ($1, $2, $3, $4) RETURNING id;
        `
				: `
            INSERT INTO actions (action_type, fk_price, fk_decision, datetime, stop_loss, take_profit)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
        `;
		const actionResult = await query(
			actionInsert,
			analysisType === "sentiment"
				? [action.toLowerCase(), price, decisionId, datetime]
				: [
						action.toLowerCase(),
						price,
						decisionId,
						datetime,
						stop_loss,
						take_profit,
				  ]
		);
		const actionId = actionResult.rows[0].id;

		await query("COMMIT");
		return { success: true, actionId, ticker };
	} catch (error) {
		await query("ROLLBACK");
		console.error("Database insertion failed:", error);
		throw error;
	}
};

export default handeGPTResponse;

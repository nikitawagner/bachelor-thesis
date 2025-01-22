import { query } from "../db/index.js";

const handleGPTResponse = async (rawResponse, price, datetime) => {
	const response = rawResponse.parsed;
	const reasonsArray = response.reasons_array;
	const confidence_score = response.confidence_score;
	const action = response.action;
	const reasoning_summary = response.reasoning_summary;
	try {
		await query("BEGIN");

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

		for (const reason of reasonsArray) {
			const sentimentInsert = `
                INSERT INTO decisions_sentiment_data (fk_sentiment_data, fk_decision, reasoning)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING;
            `;
			await query(sentimentInsert, [reason.id, decisionId, reason.reasoning]);
		}

		const actionInsert = `
            INSERT INTO actions (action_type, fk_price, fk_decision, datetime)
            VALUES ($1, $2, $3, $4);
        `;
		await query(actionInsert, [
			action.toLowerCase(),
			price,
			decisionId,
			datetime,
		]);

		await query("COMMIT");

		return { success: true, decisionId };
	} catch (error) {
		await query("ROLLBACK");
		console.error("Database insertion failed:", error);
		throw error;
	}
};

export default handleGPTResponse;

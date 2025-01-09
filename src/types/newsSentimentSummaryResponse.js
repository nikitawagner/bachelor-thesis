import { z } from "zod";

const generateNewsSentimentSummaryResponse = () => {
	const movingAverageDataSchema = z.object({
		title: z.string(),
		url: z.string(),
		summaryOfArticleContent: z.string(),
		sentimentScore: z.string(),
		relevanceScore: z.string(),
	});
	const newsSentimentSchema = z.array(movingAverageDataSchema);
	const priceDataResponse = z.object({
		"News Sentiment": newsSentimentSchema,
	});
	return priceDataResponse;
};

export default generateNewsSentimentSummaryResponse;

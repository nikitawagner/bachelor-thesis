export const devPrompt =
	"You are a financial expert that can tell if a news artile or news headline will cause a positive or negative sentiment on investors.";

export const createNewsSentimentPrompt = (ticker, data) => {
	return `
		All provided News Titles are related to the stock ${ticker}.
		For the given news Titles create a sentiment score from -1 to 1 where -1 is negative, 0 is neutral and 1 is positive.
		Also create a relevance score from 0 to 1 where 0 is not relevant and 1 is very relevant to the stock ${ticker}.
		Return the sentiment score and relevance score for each news title with 6 decimal places.
		Exampe: "Apple announces new product line for less than $400", sentiment: 0.785438, relevance: 0.987654
		${data.map((item) => {
			return `Title: ${item.title}
			URL: ${item.url}
			-----------------
			`;
		})}
	`;
};

export const createNewsSentimentSummaryPrompt = (ticker, data) => {
	return `
		All provided News Articles are related to the stock ${ticker}.
		First, Read Every provided article content and create a 3 sentence summary for every article that contains the most relevant information of that article regarding the stock: ${ticker}. Add another sentence that explains your decision.
		Next, create a sentiment score from -1 to 1 where -1 is negative, 0 is neutral and 1 is positive and use 6 decimal places.
		Then Also create a relevance score from 0 to 1 where 0 is not relevant and 1 is very relevant to the stock ${ticker}, also with 6 decimal places.
		Exampe: sentiment: 0.785438, relevance: 0.987654. Only use the data that is provided in this prompt.
		${data.map((item) => {
			return `Title: ${item.title},
			URL: ${item.url},
			Article Content: ${item.content}
			-----------------
			`;
		})}
	`;
};

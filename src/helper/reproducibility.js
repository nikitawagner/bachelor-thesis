import fs from "fs";

function computeStats(numbers) {
	if (numbers.length === 0) {
		return { max: 0, min: 0, average: 0, stdDev: 0 };
	}
	const max = Math.max(...numbers);
	const min = Math.min(...numbers);
	const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
	// Compute population standard deviation:
	const variance =
		numbers.reduce((acc, num) => acc + Math.pow(num - average, 2), 0) /
		numbers.length;
	const stdDev = Math.sqrt(variance);
	return { max, min, average, stdDev };
}

export const compareTradeData = (tradeArrays) => {
	const allowedStrategies = new Set([
		"take_profit",
		"day_close",
		"day_1_close",
		"day_2_close",
		"day_3_close",
	]);

	// Build a summary for each input array.
	// The summary structure per array is:
	// {
	//   [company]: {
	//     [analysisType]: {
	//       overall: { wins: number, losses: number },
	//       closingStrategies: {
	//         [strategy]: { wins: number, losses: number }
	//       }
	//     }
	//   }
	// }
	const summaries = tradeArrays.map((trades) => {
		const summary = {};
		trades.forEach((trade) => {
			const company = trade.Company;
			const analysisType = trade.Analysis_Type; // e.g., "technical" or "sentiment"
			const strategy = trade.Closing_Strategy;
			const result = trade.Trade_Result ? trade.Trade_Result.toUpperCase() : "";

			// Only include the trade if its strategy is allowed.
			if (!allowedStrategies.has(strategy)) {
				return; // skip this trade
			}

			// Initialize nested structure if needed.
			if (!summary[company]) summary[company] = {};
			if (!summary[company][analysisType]) {
				summary[company][analysisType] = {
					overall: { wins: 0, losses: 0 },
					closingStrategies: {},
				};
			}

			// Update overall wins/losses (only counting allowed strategies).
			if (result === "WIN") {
				summary[company][analysisType].overall.wins++;
			} else if (result === "LOSS") {
				summary[company][analysisType].overall.losses++;
			}

			// Update closing strategy counts.
			if (!summary[company][analysisType].closingStrategies[strategy]) {
				summary[company][analysisType].closingStrategies[strategy] = {
					wins: 0,
					losses: 0,
				};
			}
			if (result === "WIN") {
				summary[company][analysisType].closingStrategies[strategy].wins++;
			} else if (result === "LOSS") {
				summary[company][analysisType].closingStrategies[strategy].losses++;
			}
		});
		return summary;
	});

	// Determine the set of all companies across summaries.
	const allCompanies = new Set();
	summaries.forEach((summary) => {
		Object.keys(summary).forEach((company) => allCompanies.add(company));
	});

	let report = "";
	report += "=== Trade Data Statistics Report ===\n\n";

	// Process each company.
	allCompanies.forEach((company) => {
		report += `Company: ${company}\n`;

		// Gather all analysis types for the company.
		const analysisTypes = new Set();
		summaries.forEach((summary) => {
			if (summary[company]) {
				Object.keys(summary[company]).forEach((type) =>
					analysisTypes.add(type)
				);
			}
		});

		analysisTypes.forEach((analysisType) => {
			report += `  Analysis Type: ${analysisType}\n`;

			// For overall wins and losses, gather the value from each array.
			const overallWinsArray = summaries.map((summary) =>
				summary[company] && summary[company][analysisType]
					? summary[company][analysisType].overall.wins
					: 0
			);
			const overallLossesArray = summaries.map((summary) =>
				summary[company] && summary[company][analysisType]
					? summary[company][analysisType].overall.losses
					: 0
			);

			// Compute statistics.
			const winsStats = computeStats(overallWinsArray);
			const lossesStats = computeStats(overallLossesArray);

			report += `    Overall Wins:\n`;
			report += `      Max: ${winsStats.max}, Min: ${
				winsStats.min
			}, Average: ${winsStats.average.toFixed(
				2
			)}, Std Dev: ${winsStats.stdDev.toFixed(2)}\n`;
			report += `    Overall Losses:\n`;
			report += `      Max: ${lossesStats.max}, Min: ${
				lossesStats.min
			}, Average: ${lossesStats.average.toFixed(
				2
			)}, Std Dev: ${lossesStats.stdDev.toFixed(2)}\n`;

			// For each allowed closing strategy, compute similar statistics.
			// (Since we only stored allowed strategies, we can just list them.)
			const allStrategies = new Set();
			summaries.forEach((summary) => {
				if (summary[company] && summary[company][analysisType]) {
					Object.keys(summary[company][analysisType].closingStrategies).forEach(
						(strategy) => {
							allStrategies.add(strategy);
						}
					);
				}
			});

			if (allStrategies.size > 0) {
				report += `    Closing Strategy Breakdown:\n`;
				allStrategies.forEach((strategy) => {
					report += `      Strategy: ${strategy}\n`;

					const stratWinsArray = summaries.map((summary) => {
						if (
							summary[company] &&
							summary[company][analysisType] &&
							summary[company][analysisType].closingStrategies[strategy]
						) {
							return summary[company][analysisType].closingStrategies[strategy]
								.wins;
						}
						return 0;
					});
					const stratLossesArray = summaries.map((summary) => {
						if (
							summary[company] &&
							summary[company][analysisType] &&
							summary[company][analysisType].closingStrategies[strategy]
						) {
							return summary[company][analysisType].closingStrategies[strategy]
								.losses;
						}
						return 0;
					});

					const stratWinsStats = computeStats(stratWinsArray);
					const stratLossesStats = computeStats(stratLossesArray);

					report += `        Wins:   Max: ${stratWinsStats.max}, Min: ${
						stratWinsStats.min
					}, Average: ${stratWinsStats.average.toFixed(
						2
					)}, Std Dev: ${stratWinsStats.stdDev.toFixed(2)}\n`;
					report += `        Losses: Max: ${stratLossesStats.max}, Min: ${
						stratLossesStats.min
					}, Average: ${stratLossesStats.average.toFixed(
						2
					)}, Std Dev: ${stratLossesStats.stdDev.toFixed(2)}\n`;
				});
			}
			report += "\n";
		});
		report += "\n";
	});

	const outputFilePath =
		"outputs/comparisons/reproducibility/trade_stats_report.txt";
	try {
		fs.writeFileSync(outputFilePath, report, "utf8");
		console.log(`Report successfully saved to ${outputFilePath}`);
	} catch (error) {
		console.error(`Error writing file: ${error}`);
	}

	return report;
};

// export const compareTradeData = (tradeArrays) => {
// 	const summaries = tradeArrays.map((trades, arrayIdx) => {
// 		const summary = {};
// 		trades.forEach((trade) => {
// 			const company = trade.Company;
// 			const analysisType = trade.Analysis_Type;
// 			const strategy = trade.Closing_Strategy;
// 			const result = trade.Trade_Result ? trade.Trade_Result.toUpperCase() : "";

// 			if (!summary[company]) summary[company] = {};
// 			if (!summary[company][analysisType]) {
// 				summary[company][analysisType] = {
// 					overall: { wins: 0, losses: 0 },
// 					closingStrategies: {},
// 				};
// 			}
// 			if (result === "WIN") {
// 				summary[company][analysisType].overall.wins++;
// 			} else if (result === "LOSS") {
// 				summary[company][analysisType].overall.losses++;
// 			}
// 			if (!summary[company][analysisType].closingStrategies[strategy]) {
// 				summary[company][analysisType].closingStrategies[strategy] = {
// 					wins: 0,
// 					losses: 0,
// 				};
// 			}
// 			if (result === "WIN") {
// 				summary[company][analysisType].closingStrategies[strategy].wins++;
// 			} else if (result === "LOSS") {
// 				summary[company][analysisType].closingStrategies[strategy].losses++;
// 			}
// 		});
// 		return summary;
// 	});

// 	const allCompanies = new Set();
// 	summaries.forEach((summary) => {
// 		Object.keys(summary).forEach((company) => allCompanies.add(company));
// 	});

// 	let report = "";
// 	report += "=== Comparison Report of Trade Data Across Arrays ===\n\n";

// 	allCompanies.forEach((company) => {
// 		report += `Company: ${company}\n`;

// 		const analysisTypes = new Set();
// 		summaries.forEach((summary) => {
// 			if (summary[company]) {
// 				Object.keys(summary[company]).forEach((type) =>
// 					analysisTypes.add(type)
// 				);
// 			}
// 		});

// 		analysisTypes.forEach((analysisType) => {
// 			report += `  Analysis Type: ${analysisType}\n`;
// 			report += "    Overall Wins/Losses per Array:\n";

// 			summaries.forEach((summary, idx) => {
// 				const overall =
// 					summary[company] && summary[company][analysisType]
// 						? summary[company][analysisType].overall
// 						: { wins: 0, losses: 0 };
// 				report += `      Array ${idx + 1}: Wins: ${overall.wins}, Losses: ${
// 					overall.losses
// 				}\n`;
// 			});

// 			const allStrategies = new Set();
// 			summaries.forEach((summary) => {
// 				if (summary[company] && summary[company][analysisType]) {
// 					const strategies = summary[company][analysisType].closingStrategies;
// 					Object.keys(strategies).forEach((strategy) =>
// 						allStrategies.add(strategy)
// 					);
// 				}
// 			});

// 			if (allStrategies.size > 0) {
// 				report += "    Closing Strategy Breakdown per Array:\n";
// 				allStrategies.forEach((strategy) => {
// 					report += `      Strategy: ${strategy}\n`;
// 					summaries.forEach((summary, idx) => {
// 						const stratStats =
// 							summary[company] &&
// 							summary[company][analysisType] &&
// 							summary[company][analysisType].closingStrategies[strategy]
// 								? summary[company][analysisType].closingStrategies[strategy]
// 								: { wins: 0, losses: 0 };
// 						report += `        Array ${idx + 1}: Wins: ${
// 							stratStats.wins
// 						}, Losses: ${stratStats.losses}\n`;
// 					});
// 				});
// 			}
// 			report += "\n";
// 		});
// 		report += "\n";
// 	});
// 	const outputFilePath =
// 		"outputs/comparisons/reproducibility/comparisonReport.txt";
// 	try {
// 		fs.writeFileSync(outputFilePath, report, "utf8");
// 		console.log(`Report successfully saved to ${outputFilePath}`);
// 	} catch (error) {
// 		console.error(`Error writing file: ${error}`);
// 	}
// 	return report;
// };

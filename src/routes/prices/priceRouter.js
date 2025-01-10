import express from "express";
import {
	getAllPricesByTicker,
	getAllPricesByTimespan,
	updatePricesForTicker,
	deletePrices,
	updateAllPricesInDatabase,
	getExcludedTickers,
	getIncludedTickers,
} from "../../services/priceRequestHandler.js";

const priceRouter = express.Router();

priceRouter.post("/included", async (req, res, next) => {
	try {
		const { interval, timeFrame } = req.body;

		const prices = await getIncludedTickers(interval, timeFrame);
		res.status(200).json(prices);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.post("/excluded", async (req, res, next) => {
	try {
		const { interval, timeFrame } = req.body;

		const prices = await getExcludedTickers(interval, timeFrame);
		res.status(200).json(prices);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.post("/get/timespan", async (req, res, next) => {
	try {
		const { ticker, interval, timeFrame, dateStart, dateEnd } = req.body;

		const prices = await getAllPricesByTimespan(
			ticker,
			interval,
			timeFrame,
			dateStart,
			dateEnd
		);
		res.status(200).json(prices);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.post("/get/all", async (req, res, next) => {
	try {
		const { ticker, interval, timeFrame } = req.body;
		const prices = await getAllPricesByTicker(ticker, interval, timeFrame);
		res.status(200).json(prices);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.post("/update", async (req, res, next) => {
	try {
		const { ticker, interval, timeFrame } = req.body;
		await updatePricesForTicker(ticker, interval, timeFrame);
		res.status(200).json({ message: "Prices updated successfully" });
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.post("/update/all", async (req, res, next) => {
	try {
		const { interval, timeFrame } = req.body;
		await updateAllPricesInDatabase(interval, timeFrame);
		res.status(200).json({ message: "Prices updated successfully" });
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.delete("/", async (req, res, next) => {
	try {
		const { ticker, interval, timeFrame } = req.body;
		await deletePrices(ticker, interval, timeFrame);
		res.status(200).json({ message: "Prices deleted successfully" });
	} catch (error) {
		console.log(error);
		next(error);
	}
});

export default priceRouter;

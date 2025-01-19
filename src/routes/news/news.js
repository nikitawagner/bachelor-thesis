import express from "express";
import gNewsRouter from "./gNews.js";
import alphaNewsRouter from "./alphaNews.js";
import { query } from "../../db/index.js";
import {
	handleGetNewsByTicker,
	handleGetNewsByTickerAndDate,
} from "../../services/handleNewsRequest.js";

const newsRouter = express.Router();
newsRouter.get("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const response = await handleGetNewsByTicker(ticker);
		res.json({ message: "Success", response: response });
	} catch (error) {
		next(error);
	}
});
newsRouter.get("/:ticker/:dateStart/:dateEnd", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		const response = await handleGetNewsByTickerAndDate(
			ticker,
			dateStart,
			dateEnd
		);
		res.json({ message: "Success", response: response });
	} catch (error) {
		next(error);
	}
});
newsRouter.use("/g", gNewsRouter);
newsRouter.use("/alpha", alphaNewsRouter);

export default newsRouter;

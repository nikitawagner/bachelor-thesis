import express from "express";
import gNewsRouter from "./gNews.js";
import alphaNewsRouter from "./alphaNews.js";
import { query } from "../../db/index.js";

const newsRouter = express.Router();
newsRouter.get("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const response = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1",
			[ticker]
		);
		res.json({ message: "Success", response: response.rows });
	} catch (error) {
		next(error);
	}
});
newsRouter.get("/:ticker/:dateStart/:dateEnd", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		const response = await query(
			"SELECT * FROM sentiment_data WHERE fk_company = $1 AND datetime BETWEEN $2 AND $3",
			[ticker, dateStart, dateEnd]
		);
		res.json({ message: "Success", response: response.rows });
	} catch (error) {
		next(error);
	}
});
newsRouter.use("/g", gNewsRouter);
newsRouter.use("/alpha", alphaNewsRouter);

export default newsRouter;

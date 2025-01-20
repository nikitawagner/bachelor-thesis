import express from "express";
import {
	handleAddTechnicalRequest,
	handleGetTechnicalDataRequest,
} from "../../services/technicalRequestHandler.js";

const technicalRouter = express.Router();
technicalRouter.post("/add/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const { functionType, dateStart, dateEnd, limit, timePeriod } = req.body;
		const response = await handleAddTechnicalRequest(
			ticker,
			functionType,
			dateStart,
			dateEnd,
			limit,
			timePeriod
		);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

technicalRouter.post("/get/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const { functionType, dateStart, dateEnd } = req.body;
		const response = await handleGetTechnicalDataRequest(
			ticker,
			dateStart,
			dateEnd,
			functionType
		);
		res.json({ message: "Success", response });
	} catch (error) {
		next(error);
	}
});

export default technicalRouter;

import express from "express";
import { handleAddTechnicalRequest } from "../../services/technicalRequestHandler.js";

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

export default technicalRouter;

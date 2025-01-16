import express from "express";
import {
	handleDeleteAllGNewsRequest,
	handleDeleteGNewsRequest,
	handleGetAllGNewsRequest,
	handleGetGNewsRequest,
	handleUpdateAllGNewsRequest,
	handleUpdateGNewsRequest,
} from "../../services/gNewsRequestHandler.js";
import {
	handleGetAllAlphaRequest,
	handleGetAlphaRequest,
	handleUpdateAllAlphaRequest,
	handleUpdateAlphaRequest,
} from "../../services/alphaNewsRequestHandler.js";

const alphaNewsRouter = express.Router();

// get the present news for given ticker
alphaNewsRouter.get("/:ticker/:dateStart/:dateEnd", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		const news = await handleGetAlphaRequest(ticker, dateStart, dateEnd);
		res.json({ message: "Success", news });
	} catch (error) {
		next(error);
	}
});

// get all news for the given ticker
alphaNewsRouter.get("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const news = await handleGetAllAlphaRequest(ticker);
		res.json({ message: "Success", news });
	} catch (error) {
		next(error);
	}
});

alphaNewsRouter.post(
	"/all/:dateStart/:dateEnd/:limit",
	async (req, res, next) => {
		try {
			console.log("in all");
			const { dateStart, dateEnd, limit } = req.params;
			const response = await handleUpdateAllAlphaRequest(
				dateStart,
				dateEnd,
				limit
			);
			console.log(response);
			res.json({ message: "Success", response });
		} catch (error) {
			next(error);
		}
	}
);

// get new news for the given ticker
alphaNewsRouter.post(
	"/:ticker/:dateStart/:dateEnd/:limit",
	async (req, res, next) => {
		try {
			const { ticker, dateStart, dateEnd, limit } = req.params;
			await handleUpdateAlphaRequest(ticker, dateStart, dateEnd, limit);
			res.json({ message: "Success" });
		} catch (error) {
			next(error);
		}
	}
);

// delete news for the given ticker
alphaNewsRouter.delete(
	"/:ticker/:dateStart/:dateEnd",
	async (req, res, next) => {
		try {
			const { ticker, dateStart, dateEnd } = req.params;
			await handleDeleteGNewsRequest(ticker, dateStart, dateEnd);
			res.json({ message: "Success" });
		} catch (error) {
			next(error);
		}
	}
);

// delete news for the given ticker
alphaNewsRouter.delete("/:ticker", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		await handleDeleteAllGNewsRequest(ticker, dateStart, dateEnd);
		res.json({ message: "Success" });
	} catch (error) {
		next(error);
	}
});

export default alphaNewsRouter;

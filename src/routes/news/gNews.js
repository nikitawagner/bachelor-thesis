import express from "express";
import {
	handleDeleteAllGNewsRequest,
	handleDeleteGNewsRequest,
	handleGetAllGNewsRequest,
	handleGetGNewsRequest,
	handleUpdateGNewsRequest,
} from "../../services/gNewsRequestHandler.js";

const gNewsRouter = express.Router();

// get the present news for given ticker
gNewsRouter.get("/:ticker/:dateStart/:dateEnd", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		const news = await handleGetGNewsRequest(ticker, dateStart, dateEnd);
		res.json({ message: "Success", news });
	} catch (error) {
		next(error);
	}
});

// get all news for the given ticker
gNewsRouter.get("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const news = await handleGetAllGNewsRequest(ticker);
		res.json({ message: "Success", news });
	} catch (error) {
		next(error);
	}
});

// get new news for the given ticker
gNewsRouter.post("/:ticker/:dateStart/:dateEnd", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		await handleUpdateGNewsRequest(ticker, dateStart, dateEnd);
		res.json({ message: "Success" });
	} catch (error) {
		next(error);
	}
});

// delete news for the given ticker
gNewsRouter.delete("/:ticker/:dateStart/:dateEnd", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		await handleDeleteGNewsRequest(ticker, dateStart, dateEnd);
		res.json({ message: "Success" });
	} catch (error) {
		next(error);
	}
});

// delete news for the given ticker
gNewsRouter.delete("/:ticker", async (req, res, next) => {
	try {
		const { ticker, dateStart, dateEnd } = req.params;
		await handleDeleteAllGNewsRequest(ticker, dateStart, dateEnd);
		res.json({ message: "Success" });
	} catch (error) {
		next(error);
	}
});

export default gNewsRouter;

import express from "express";
import {
	addCompany,
	deleteCompany,
	getCompanyByTicker,
	updateCompany,
} from "../../services/companyRequestHandler.js";
import { getAllPricesByTicker } from "../../services/priceRequestHandler.js";

const priceRouter = express.Router();
priceRouter.get("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const prices = await getAllPricesByTicker(ticker);
		res.status(200).json(prices);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.post("/update/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const updatedPrices = await updatePricesForTicker(ticker);
		res.status(200).json(updatedPrices);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.patch("/", async (req, res, next) => {
	try {
		const { ticker, name, sector, volatility, size } = req.body;
		const updatedCompany = await updateCompany(
			ticker,
			name,
			sector,
			volatility,
			size
		);
		res.status(200).json(updatedCompany);
	} catch (error) {
		console.log(error);
		next(error);
	}
});

priceRouter.delete("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const company = await getCompanyByTicker(ticker);
		if (!company) {
			return res.status(404).json("Company not found");
		} else {
			const deletedCompany = await deleteCompany(ticker);
			return res.status(200).json(deletedCompany);
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
});

export default priceRouter;

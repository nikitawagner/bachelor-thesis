import express from "express";
import {
	addCompany,
	deleteCompany,
	getAllCompanies,
	getCompanyByTicker,
	updateCompany,
} from "../../services/companyRequestHandler.js";

const companyRouter = express.Router();
companyRouter.get("/:ticker", async (req, res, next) => {
	try {
		const { ticker } = req.params;
		const company = await getCompanyByTicker(ticker);
		res.status(200).json(company);
	} catch (error) {
		next(error);
	}
});

companyRouter.get("/", async (req, res, next) => {
	try {
		const companies = await getAllCompanies();
		res.status(200).json(companies);
	} catch (error) {
		next(error);
	}
});

companyRouter.post("/", async (req, res, next) => {
	try {
		const { ticker, name, sector, volatility, size } = req.body;
		const newCompany = await addCompany(ticker, name, sector, volatility, size);
		res.status(200).json(newCompany);
	} catch (error) {
		next(error);
	}
});

companyRouter.patch("/", async (req, res, next) => {
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
		next(error);
	}
});

companyRouter.delete("/:ticker", async (req, res, next) => {
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
		next(error);
	}
});

export default companyRouter;

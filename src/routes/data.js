import express from "express";
import companyRouter from "./company/companyRouter.js";

const dataRouter = express.Router();
dataRouter.use("/company", companyRouter);
dataRouter.get("/", (req, res) => {
	res.send("data router is working");
});
export default dataRouter;

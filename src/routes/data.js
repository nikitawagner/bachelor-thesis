import express from "express";
import companyRouter from "./company/companyRouter.js";
import priceRouter from "./prices/priceRouter.js";
import newsRouter from "./news/news.js";

const dataRouter = express.Router();
dataRouter.use("/company", companyRouter);
dataRouter.use("/prices", priceRouter);
dataRouter.use("/news", newsRouter);
dataRouter.get("/", (req, res) => {
	res.send("data router is working");
});
export default dataRouter;

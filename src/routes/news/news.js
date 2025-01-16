import express from "express";
import gNewsRouter from "./gNews.js";
import alphaNewsRouter from "./alphaNews.js";

const newsRouter = express.Router();
newsRouter.use("/g", gNewsRouter);
newsRouter.use("/alpha", alphaNewsRouter);

export default newsRouter;

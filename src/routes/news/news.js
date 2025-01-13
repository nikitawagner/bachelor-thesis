import express from "express";
import gNewsRouter from "./gNews.js";

const newsRouter = express.Router();
newsRouter.use("/g", gNewsRouter);

export default newsRouter;

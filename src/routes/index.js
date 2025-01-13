import express from "express";
import comparisonRouter from "./comparison.js";
import dataRouter from "./data.js";
const router = express.Router();

router.use("/comparison", comparisonRouter);
router.use("/data", dataRouter);
router.get("/", async (req, res) => {
	res.send("API is running");
});

export default router;

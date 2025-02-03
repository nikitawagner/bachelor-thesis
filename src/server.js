import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";
import errorHandler from "./helper/errorHandler.js";
import one from "../outputs/comparisons/reproducibility/1.json" assert { type: "json" };
import two from "../outputs/comparisons/reproducibility/2.json" assert { type: "json" };
import three from "../outputs/comparisons/reproducibility/3.json" assert { type: "json" };
import four from "../outputs/comparisons/reproducibility/4.json" assert { type: "json" };
import five from "../outputs/comparisons/reproducibility/5.json" assert { type: "json" };
import { compareTradeData } from "./helper/reproducibility.js";
const app = express();
dotenv.config();
cors();
app.use(express.json());
app.use(morgan("dev"));
app.use("/v1", router);
app.use(errorHandler);

compareTradeData([one, two, three, four, five]);
app.listen(process.env.PORT || 3000, () => {
	return console.log(
		`Express is listening at http://localhost:${process.env.PORT || 3000}`
	);
});

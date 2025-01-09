import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";
import errorHandler from "./helper/errorHandler.js";
const app = express();
dotenv.config();
cors();
app.use(express.json());
app.use(morgan("dev"));
app.use("/v1", router);
app.use(errorHandler);
app.listen(process.env.PORT || 3000, () => {
	return console.log(
		`Express is listening at http://localhost:${process.env.PORT || 3000}`
	);
});

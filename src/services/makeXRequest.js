import xAPI from "../apis/xAPI.js";
import ReturnError from "../helper/ReturnError.js";

const makeXRequest = async () => {
	try {
		const params = {
			query: "$AAPL -discord -🚀",
		};
		const res = await xAPI.get("/", { params });
	} catch (error) {
		throw new ReturnError(error, error.status);
	}
};

export default makeXRequest;

import axios from "axios";
import "dotenv/config";

const baseUrl = "https://www.alphavantage.co/query?";
const alphavantageAPI = axios.create({
	baseURL: baseUrl,
	params: {
		apikey: process.env.ALPHAVANTAGE,
	},
});
export default alphavantageAPI;

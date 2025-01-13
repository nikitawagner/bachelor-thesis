import axios from "axios";
import "dotenv/config";

const baseUrl = "https://gnews.io/api/v4/search?";
const gNewsAPI = axios.create({
	baseURL: baseUrl,
	params: {
		apikey: process.env.GNEWS,
	},
});
export default gNewsAPI;

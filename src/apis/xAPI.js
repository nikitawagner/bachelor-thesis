import axios from "axios";
import "dotenv/config";

const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
const xAPI = axios.create({
	baseURL: baseUrl,
	headers: {
		Authorization: `Bearer ${process.env.TWITTER}`,
	},
});
export default xAPI;

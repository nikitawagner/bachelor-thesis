import axios from "axios";
import "dotenv/config";

const baseUrl = "https://api.openai.com/v1/";

const gptAPI = axios.create({
	baseURL: baseUrl,
	headers: {
		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
	},
});

export default gptAPI;

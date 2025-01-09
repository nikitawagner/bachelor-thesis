import fs from "fs";

const ensureDirectoryExists = (dirPath) => {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
};

export default ensureDirectoryExists;

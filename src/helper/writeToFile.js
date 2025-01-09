import fs from "fs";

const writeToFile = (filePath, data) => {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export default writeToFile;

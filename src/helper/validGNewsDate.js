const validGNewsDate = (date) => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
	return dateRegex.test(date);
};

export default validGNewsDate;

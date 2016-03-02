function IndexOf(o, value) {

	for (var key in o) {
		if (o[key] === value) {
			return key;
		}
	}

	return -1;
}

module.exports = {
	indexOf: IndexOf
};
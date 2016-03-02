function IndexOf(o, value) {

	for (var key in o) {
		if (o[key] === value) {
			return key;
		}
	}

	return -1;
}

modules.export = {
	indexOf: IndexOf
};
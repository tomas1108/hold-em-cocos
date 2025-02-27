export const format = (currency: number, symbol: boolean): string => {
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
	return formatter.format(currency).replace(symbol ? "$" : "", "");
};

export function isInvoicePending(statusInvoice) {
	return parseInt(statusInvoice, 10) !== 1;
}

export function isInvoiceDone(statusInvoice) {
	return parseInt(statusInvoice, 10) === 1;
}

export function getApiErrorMessage(error, fallback = 'Ocurrió un error') {
	const payload = error
		&& error.response
		&& error.response.data
		&& error.response.data.error;

	if (!payload) {
		return (error && error.message) || fallback;
	}

	const parts = [];
	if (payload.step) {
		parts.push(`[${payload.step}]`);
	}
	if (payload.message) {
		parts.push(payload.message);
	}

	return parts.join(' ') || fallback;
}

export function logApiError(context, error) {
	const payload = error
		&& error.response
		&& error.response.data
		&& error.response.data.error;

	console.error(`[${context}]`, payload || error);
}

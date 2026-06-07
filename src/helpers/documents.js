export function parseRequiredDocuments(value) {
	if (!value || (typeof value === 'string' && value.trim() === '')) {
		return [];
	}

	if (Array.isArray(value)) {
		return value.map((doc) => String(doc).trim()).filter(Boolean);
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed.startsWith('[')) {
			try {
				const parsed = JSON.parse(trimmed);
				if (Array.isArray(parsed)) {
					return parsed.map((doc) => String(doc).trim()).filter(Boolean);
				}
			} catch (error) {
				// fallback
			}
		}
		return trimmed.split(',').map((doc) => doc.trim()).filter(Boolean);
	}

	return [];
}

export function formatDocumentName(docType) {
	return String(docType).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

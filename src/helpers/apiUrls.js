import AppConfig from 'Constants/AppConfig';

export function buildLegalDocumentUrl(documentKey) {
	const base = AppConfig.apiUrl.replace(/\/$/, '');
	return `${base}/api/legal_documents/file/${documentKey}`;
}

export function buildApiFileUrl(filePathOrDoc) {
	if (typeof filePathOrDoc === 'object' && filePathOrDoc !== null) {
		if (filePathOrDoc.public_url) {
			const base = AppConfig.apiUrl.replace(/\/$/, '');
			const path = filePathOrDoc.public_url.startsWith('/')
				? filePathOrDoc.public_url
				: `/${filePathOrDoc.public_url}`;
			return `${base}${path}`;
		}
		if (filePathOrDoc.document_key) {
			return buildLegalDocumentUrl(filePathOrDoc.document_key);
		}
	}

	const base = AppConfig.apiUrl.replace(/\/$/, '');
	const path = String(filePathOrDoc).startsWith('/') ? filePathOrDoc : `/${filePathOrDoc}`;
	return `${base}${path}`;
}

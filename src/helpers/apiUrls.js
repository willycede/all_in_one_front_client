import AppConfig from 'Constants/AppConfig';

export function buildApiFileUrl(filePath) {
	const base = AppConfig.apiUrl.replace(/\/$/, '');
	const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
	return `${base}${path}`;
}

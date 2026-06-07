import axios from 'axios';
import AppConfig from '../constants/AppConfig';

const api = axios.create({
	baseURL: AppConfig.apiUrl,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('access_token');
	if (token) {
		config.headers.authorization = token;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && (error.response.status === 401 || error.response.status === 403)) {
			const path = window.location.pathname || '';
			const isAuthRoute = path.includes('/client/login') || path.includes('/client/register');
			if (!isAuthRoute && localStorage.getItem('access_token')) {
				localStorage.removeItem('access_token');
			}
		}
		return Promise.reject(error);
	}
);

export default api;

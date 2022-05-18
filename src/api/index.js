import axios from 'axios';
import AppConfig from '../constants/AppConfig';

export default
	axios.create({
		baseURL: AppConfig.apiUrl
	});
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
	baseURL: 'http://localhost:8082/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Thêm interceptor vào axios instance
api.interceptors.request.use((config) => {
	const token = Cookies.get('token');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		console.log('Error in interceptor:', error.response?.status); // Debugging line
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = Cookies.get('token');
			try {
				const response = await axios.post('/auth/refreshtoken', { token: refreshToken });
				const { accessToken } = response.data;
				Cookies.set('token', accessToken);
				originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
				return api(originalRequest);
			} catch {
				// Cookies.remove('token');
				// Cookies.remove('token');
				// window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;

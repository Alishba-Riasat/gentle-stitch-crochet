import api from './api';

const login = async (email, password) => {
	const response = await api.post('/auth/login', { email, password });
	// store user info (token etc.) for later requests
	if (response?.data) localStorage.setItem('userInfo', JSON.stringify(response.data));
	return response.data;
};

const register = async (name, email, password) => {
	const response = await api.post('/auth/register', { name, email, password });
	return response.data;
};

const logout = async () => {
	try {
		await api.post('/auth/logout');
	} finally {
		localStorage.removeItem('userInfo');
	}
};

export default { login, register, logout };

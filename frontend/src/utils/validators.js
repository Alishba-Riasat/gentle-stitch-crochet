export const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

export const isValidEmail = (email) => {
	if (typeof email !== 'string') return false;
	return emailRegex.test(email.trim());
};

export const isValidPassword = (pw) => {
	return typeof pw === 'string' && pw.trim().length >= 6;
};

export const isValidName = (name) => {
	return typeof name === 'string' && name.trim().length >= 2;
};

export default { isValidEmail, isValidPassword, isValidName };

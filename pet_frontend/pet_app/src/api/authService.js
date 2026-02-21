import api from './client';

export const loginUser = (credentials) => {
  // Expects: { email, password, role }
  return api.post('/auth/login', credentials);
};

export const registerUser = (userData) => {
  // Expects: User Object
  return api.post('/auth/register', userData);
};
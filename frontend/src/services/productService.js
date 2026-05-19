import api from './api';

export const fetchProducts = async (params) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const addProductReview = async (id, reviewData) => {
  const response = await api.post(`/products/${id}/reviews`, reviewData);
  return response.data;
};

// Admin only
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
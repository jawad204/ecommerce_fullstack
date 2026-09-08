import api from '../../api/axiosClient';
import type { Product, Category } from '../../types';

export const productsApi = {
  getProducts: (params?: { category?: number; search?: string; ordering?: string }) =>
    api.get<Product[]>('/products/', { params }),
  getProduct: (slug: string) => api.get<Product>(`/products/${slug}/`),
  getCategories: () => api.get<Category[]>('/products/categories/'),
  createProduct: (data: FormData) => api.post<Product>('/products/', data),
  deleteProduct: (slug: string) => api.delete(`/products/${slug}/`),
};
import api from '../../api/axiosClient';
import type { User } from '../../types';

interface LoginResponse {
  access: string;
  refresh: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  phone_number?: string;
  address?: string;
  is_seller: boolean;
}

interface LoginPayload {
    username: string;
    password: string;
}

export const authApi = {
  register: (data: RegisterPayload) => api.post<User>('/auth/register/', data),
  login: (data : LoginPayload) =>
    api.post<LoginResponse>('/auth/login/', data),
  getProfile: () => api.get<User>('/auth/profile/'),
};


export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getAuthHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface RequestOptions extends RequestInit {
  skipRedirect?: boolean;
}

export const apiRequest = async (url: string, options: RequestOptions = {}) => {
  const { skipRedirect, ...fetchOptions } = options;
  
  const headers = {
    ...getAuthHeaders(),
    ...fetchOptions.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401 && !skipRedirect) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Fallback if response is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

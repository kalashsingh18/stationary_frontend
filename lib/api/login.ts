import { AuthResponse } from "@/lib/types";
import { apiRequest } from './config';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipRedirect: true,
  });

  if (!data.success) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

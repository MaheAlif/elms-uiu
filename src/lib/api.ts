const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API response types
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    avatar_url?: string;
  };
  redirect_url: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config: RequestInit = {
        headers: this.getHeaders(),
        ...options,
      };

      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string, role: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (response.success && response.data?.token) {
      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request('/auth/logout', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    } finally {
      // Always clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear any other auth-related data
        localStorage.removeItem('auth');
      }
    }
  }

  async getSession(): Promise<ApiResponse> {
    return this.request('/auth/session');
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    avatar_url?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Student endpoints
  async getStudentCourses(): Promise<ApiResponse> {
    return this.request('/student/courses');
  }

  async getStudentMaterials(courseId?: string): Promise<ApiResponse> {
    const endpoint = courseId ? `/student/materials?courseId=${courseId}` : '/student/materials';
    return this.request(endpoint);
  }

  async getStudentCalendar(): Promise<ApiResponse> {
    return this.request('/student/calendar');
  }

  async getChatMessages(roomId: string): Promise<ApiResponse> {
    return this.request(`/student/chat?roomId=${roomId}`);
  }

  // Teacher endpoints
  async getTeacherCourses(): Promise<ApiResponse> {
    return this.request('/teacher/courses');
  }

  async createAssignment(assignmentData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  // Admin endpoints
  async getAdminStats(): Promise<ApiResponse> {
    return this.request('/admin/stats');
  }

  async getAllUsers(): Promise<ApiResponse> {
    return this.request('/admin/users');
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, LoginResponse };
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
    const endpoint = courseId ? `/student/materials?course_id=${courseId}` : '/student/materials';
    return this.request(endpoint);
  }

  async getStudentCalendar(): Promise<ApiResponse> {
    return this.request('/student/calendar');
  }

  async getChatMessages(roomId: string): Promise<ApiResponse> {
    return this.request(`/student/chat?roomId=${roomId}`);
  }

  async getStudentAssignments(courseId?: string): Promise<ApiResponse> {
    const endpoint = courseId ? `/student/assignments?course_id=${courseId}` : '/student/assignments';
    return this.request(endpoint);
  }

  async submitAssignment(assignmentId: string, formData: FormData): Promise<ApiResponse> {
    const token = this.getToken();
    return fetch(`${API_BASE_URL}/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json());
  }

  // Teacher endpoints
  async getTeacherCourses(): Promise<ApiResponse> {
    return this.request('/teacher/courses');
  }

  async getTeacherCourseDetails(courseId: string): Promise<ApiResponse> {
    return this.request(`/teacher/courses/${courseId}/details`);
  }

  async getTeacherStudents(courseId?: string): Promise<ApiResponse> {
    const endpoint = courseId ? `/teacher/students?course_id=${courseId}` : '/teacher/students';
    return this.request(endpoint);
  }

  async getTeacherMaterials(courseId?: string, sectionId?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId);
    if (sectionId) params.append('section_id', sectionId);
    
    const endpoint = params.toString() ? `/teacher/materials?${params}` : '/teacher/materials';
    return this.request(endpoint);
  }

  async uploadMaterial(materialData: FormData): Promise<ApiResponse> {
    const token = this.getToken();
    return fetch(`${API_BASE_URL}/teacher/materials/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: materialData,
    }).then(res => res.json());
  }

  async deleteMaterial(materialId: string): Promise<ApiResponse> {
    return this.request(`/teacher/materials/${materialId}`, {
      method: 'DELETE',
    });
  }

  async getTeacherAssignments(courseId?: string): Promise<ApiResponse> {
    const endpoint = courseId ? `/teacher/assignments?course_id=${courseId}` : '/teacher/assignments';
    return this.request(endpoint);
  }

  async createAssignment(assignmentData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async updateAssignment(assignmentId: string, assignmentData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/teacher/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse> {
    return this.request(`/teacher/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  async getAssignmentSubmissions(assignmentId: string): Promise<ApiResponse> {
    return this.request(`/teacher/assignments/${assignmentId}/submissions`);
  }

  async gradeSubmission(submissionId: string, gradeData: { grade: number; feedback?: string }): Promise<ApiResponse> {
    return this.request(`/teacher/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    });
  }

  async downloadSubmission(submissionId: string): Promise<void> {
    const token = this.getToken();
    const url = `${API_BASE_URL}/teacher/submissions/${submissionId}/download`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'submission_file';
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } else {
      throw new Error('Failed to download submission');
    }
  }

  async getTeacherSections(courseId?: string): Promise<ApiResponse> {
    const endpoint = courseId ? `/teacher/sections?course_id=${courseId}` : '/teacher/sections';
    return this.request(endpoint);
  }

  // Teachers can only VIEW sections, not create them (admin-only)

  // Admin endpoints
  async getAdminStats(): Promise<ApiResponse> {
    return this.request('/admin/stats');
  }

  async getAllUsers(params?: { role?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() ? `/admin/users?${searchParams}` : '/admin/users';
    return this.request(endpoint);
  }

  async getAdminCourses(params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() ? `/admin/courses?${searchParams}` : '/admin/courses';
    return this.request(endpoint);
  }

  async createAdminCourse(courseData: {
    course_name: string;
    course_code: string;
    description: string;
    credits: number;
    semester: string;
    academic_year: string;
  }): Promise<ApiResponse> {
    return this.request('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateAdminCourse(courseId: string, courseData: {
    course_name?: string;
    course_code?: string;
    description?: string;
    credits?: number;
    semester?: string;
    academic_year?: string;
  }): Promise<ApiResponse> {
    return this.request(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteAdminCourse(courseId: string): Promise<ApiResponse> {
    return this.request(`/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async getTeachers(): Promise<ApiResponse> {
    return this.request('/admin/teachers');
  }

  async assignTeacher(teacherId: string, courseId: string): Promise<ApiResponse> {
    return this.request('/admin/assign-teacher', {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId, course_id: courseId }),
    });
  }

  async unassignTeacher(teacherId: string, courseId: string): Promise<ApiResponse> {
    return this.request('/admin/assign-teacher', {
      method: 'DELETE',
      body: JSON.stringify({ teacher_id: teacherId, course_id: courseId }),
    });
  }

  async enrollStudent(studentId: string, sectionId: string): Promise<ApiResponse> {
    return this.request('/admin/enrollments', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, section_id: sectionId }),
    });
  }

  async getCourseEnrollments(courseId: string): Promise<ApiResponse> {
    return this.request(`/admin/enrollments/${courseId}`);
  }

  async removeEnrollment(enrollmentId: string): Promise<ApiResponse> {
    return this.request(`/admin/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  }

  // ===== SECTION MANAGEMENT ENDPOINTS (ADMIN ONLY) =====
  
  async getAdminSections(courseId?: string): Promise<ApiResponse> {
    const queryParam = courseId ? `?course_id=${courseId}` : '';
    return this.request(`/admin/sections${queryParam}`);
  }

  async createAdminSection(sectionData: {
    course_id: number;
    name: string;
    teacher_id?: number;
    max_capacity?: number;
  }): Promise<ApiResponse> {
    return this.request('/admin/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });
  }

  async getSectionDetails(sectionId: string): Promise<ApiResponse> {
    return this.request(`/admin/sections/${sectionId}`);
  }

  async updateSection(sectionId: string, sectionData: {
    name?: string;
    teacher_id?: number | null;
    max_capacity?: number;
  }): Promise<ApiResponse> {
    return this.request(`/admin/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
    });
  }

  async deleteSection(sectionId: string): Promise<ApiResponse> {
    return this.request(`/admin/sections/${sectionId}`, {
      method: 'DELETE',
    });
  }

  async assignTeacherToSection(sectionId: string, teacherId: number): Promise<ApiResponse> {
    return this.request(`/admin/sections/${sectionId}/assign-teacher`, {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId }),
    });
  }

  async removeTeacherFromSection(sectionId: string): Promise<ApiResponse> {
    return this.request(`/admin/sections/${sectionId}/teacher`, {
      method: 'DELETE',
    });
  }

  // Profile and detail view endpoints
  async getTeacherProfile(teacherId: string): Promise<ApiResponse> {
    return this.request(`/admin/teachers/${teacherId}/profile`);
  }

  async getStudentProfile(studentId: string): Promise<ApiResponse> {
    return this.request(`/admin/students/${studentId}/profile`);
  }

  async getCourseDetails(courseId: string): Promise<ApiResponse> {
    return this.request(`/admin/courses/${courseId}/details`);
  }

  // User creation endpoints
  async createTeacher(teacherData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  async createStudent(studentData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  // ===== CALENDAR & NOTIFICATION ENDPOINTS =====

  // Student calendar and notifications
  async getStudentNotifications(): Promise<ApiResponse> {
    return this.request('/student/notifications');
  }

  async markNotificationRead(notificationId: string): Promise<ApiResponse> {
    return this.request(`/student/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    return this.request('/student/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  // Teacher calendar and notifications
  async getTeacherCalendar(): Promise<ApiResponse> {
    return this.request('/teacher/calendar');
  }

  async createCalendarEvent(eventData: {
    section_id: number;
    title: string;
    description?: string;
    date: string;
    type: 'assignment' | 'exam' | 'meeting' | 'class';
  }): Promise<ApiResponse> {
    return this.request('/teacher/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateCalendarEvent(eventId: string, eventData: {
    title: string;
    description?: string;
    date: string;
    type: 'assignment' | 'exam' | 'meeting' | 'class';
  }): Promise<ApiResponse> {
    return this.request(`/teacher/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteCalendarEvent(eventId: string): Promise<ApiResponse> {
    return this.request(`/teacher/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async createAnnouncement(announcementData: {
    section_id: number;
    title: string;
    content: string;
  }): Promise<ApiResponse> {
    return this.request('/teacher/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  }

  async getTeacherNotifications(): Promise<ApiResponse> {
    return this.request('/teacher/notifications');
  }

  async markTeacherNotificationRead(notificationId: string): Promise<ApiResponse> {
    return this.request(`/teacher/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Admin calendar and notifications
  async getAdminCalendar(): Promise<ApiResponse> {
    return this.request('/admin/calendar');
  }

  async createUniversityEvent(eventData: {
    title: string;
    description?: string;
    date: string;
    type: 'holiday' | 'exam_week' | 'registration' | 'orientation' | 'graduation' | 'maintenance' | 'event';
    priority?: 'low' | 'normal' | 'high';
  }): Promise<ApiResponse> {
    return this.request('/admin/calendar/university-events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateUniversityEvent(eventId: string, eventData: {
    title: string;
    description?: string;
    date: string;
    type: 'holiday' | 'exam_week' | 'registration' | 'orientation' | 'graduation' | 'maintenance' | 'event';
    priority?: 'low' | 'normal' | 'high';
  }): Promise<ApiResponse> {
    return this.request(`/admin/calendar/university-events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteUniversityEvent(eventId: string): Promise<ApiResponse> {
    return this.request(`/admin/calendar/university-events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async getAdminNotifications(params?: {
    type?: string;
    read_status?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.read_status !== undefined) searchParams.append('read_status', params.read_status.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() ? `/admin/notifications?${searchParams}` : '/admin/notifications';
    return this.request(endpoint);
  }

  async broadcastNotification(notificationData: {
    message: string;
    type: 'assignment' | 'due_event' | 'reminder' | 'grade_posted';
    target_roles?: ('student' | 'teacher' | 'admin')[];
  }): Promise<ApiResponse> {
    return this.request('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // ===== AI ASSISTANT ENDPOINTS =====

  /**
   * Get AI chat history
   * GET /api/student/ai/history
   */
  async getAIChatHistory(): Promise<ApiResponse> {
    return this.request('/student/ai/history');
  }

  /**
   * Send message to AI
   * POST /api/student/ai/chat
   */
  async sendAIMessage(message: string, file?: File): Promise<ApiResponse> {
    if (file) {
      // If file is attached, use FormData
      const formData = new FormData();
      formData.append('message', message);
      formData.append('file', file);

      const token = this.getToken();
      return fetch(`${API_BASE_URL}/student/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }).then(res => res.json());
    } else {
      // No file, use JSON
      return this.request('/student/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    }
  }

  /**
   * Add study material to AI context
   * POST /api/student/ai/add-material/:materialId
   */
  async addMaterialToAI(materialId: string): Promise<ApiResponse> {
    return this.request(`/student/ai/add-material/${materialId}`, {
      method: 'POST',
    });
  }

  /**
   * Get AI context (attached materials)
   * GET /api/student/ai/context
   */
  async getAIContext(): Promise<ApiResponse> {
    return this.request('/student/ai/context');
  }

  /**
   * Remove material from AI context
   * DELETE /api/student/ai/remove-material/:materialId
   */
  async removeAIMaterial(materialId: number): Promise<ApiResponse> {
    return this.request(`/student/ai/remove-material/${materialId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Clear AI context
   * DELETE /api/student/ai/clear-context
   */
  async clearAIContext(): Promise<ApiResponse> {
    return this.request('/student/ai/clear-context', {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, LoginResponse };
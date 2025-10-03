export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  description: string;
  credits: number;
  semester: string;
  academic_year: string;
  teacher_id?: number;
  teacher_name?: string;
  teacher_email?: string;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    new_this_week: number;
  };
  courses: {
    total: number;
    with_teachers: number;
    without_teachers: number;
    new_this_week: number;
  };
  materials: {
    total: number;
  };
  recent_activity: {
    new_users_last_7_days: number;
    new_courses_last_7_days: number;
  };
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  course_count: number;
  avatar_url?: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  student_name: string;
  student_email: string;
  enrolled_at: string;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'pptx' | 'docx' | 'video';
  url: string;
  uploadDate: string;
  size: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'assignment' | 'exam' | 'class' | 'meeting';
  courseId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

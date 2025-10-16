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
  // Section information (when course is accessed through a section)
  section_id?: number;
  section_name?: string;
  section_max_capacity?: number;
  section_current_enrollment?: number;
}

export interface Section {
  id: number;
  course_id: number;
  course_code: string;
  course_title: string;
  name: string;
  teacher_id?: number;
  teacher_name?: string;
  max_capacity: number;
  current_enrollment: number;
  created_at: string;
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
  section_id?: number; // NEW: Section enrollment
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
  id: string | number;
  sender_id?: number;
  sender_name?: string;
  sender?: string; // For backward compatibility
  sender_avatar?: string;
  avatar?: string; // For backward compatibility
  message: string;
  message_type?: 'text' | 'image' | 'file';
  file_url?: string;
  timestamp: string;
  isCurrentUser?: boolean;
  room_id?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'assignment' | 'exam' | 'class' | 'meeting' | 'university_event' | 'holiday' | 'exam_week' | 'registration' | 'orientation' | 'graduation' | 'maintenance' | 'event';
  courseId?: string;
  course_name?: string;
  course_code?: string;
  course_color?: string;
  status?: string;
  priority?: 'low' | 'normal' | 'high';
  submission_count?: number;
  total_students?: number;
  teacher_name?: string;
}

export interface Notification {
  id: number;
  type: 'assignment' | 'due_event' | 'reminder' | 'grade_posted';
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface UniversityEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  type: 'holiday' | 'exam_week' | 'registration' | 'orientation' | 'graduation' | 'maintenance' | 'event';
  priority: 'low' | 'normal' | 'high';
  created_by: number;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

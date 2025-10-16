"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { CalendarPanel } from "@/components/calendar-panel"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import type { Course, User, Teacher, AdminStats } from "@/types"
import { 
  LogOut, 
  Settings, 
  User as UserIcon, 
  GraduationCap,
  BookOpen,
  Users,
  UserPlus,
  Plus,
  Trash2,
  Edit,
  Shield,
  School,
  Calendar,
  CalendarDays,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
  Eye,
  Mail,
  Layers
} from "lucide-react"
import { SimpleSectionManagement } from "@/components/admin/simple-section-management"

function AdminDashboardContent() {
  // State management
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([]) // NEW: All sections for dropdowns
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    course_code: '',
    description: '',
    credits: 3,
    semester: 'Fall' as 'Fall' | 'Spring' | 'Summer',
    academic_year: '2024-2025'
  })
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('') // CHANGED: from courseId to sectionId
  const [selectedStudentId, setSelectedStudentId] = useState('')

  // User creation states
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: ''
  })

  // University event creation state
  const [newUniversityEvent, setNewUniversityEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: 'event' as 'holiday' | 'exam_week' | 'registration' | 'orientation' | 'graduation' | 'maintenance' | 'event',
    priority: 'normal' as 'low' | 'normal' | 'high'
  })

  // Modal states
  const [teacherModalOpen, setTeacherModalOpen] = useState(false)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [sectionStudentsModalOpen, setSectionStudentsModalOpen] = useState(false)
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState<any>(null)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null)
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null)
  const [selectedSectionStudents, setSelectedSectionStudents] = useState<any>(null)

  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    loadAdminData()
    loadCalendarEvents()
  }, [])

  const loadAdminData = async () => {
    console.log('🔄 loadAdminData called - refreshing all data...')
    setLoading(true)
    try {
      const [statsRes, coursesRes, teachersRes, studentsRes, sectionsRes] = await Promise.all([
        apiClient.getAdminStats(),
        apiClient.getAdminCourses(),
        apiClient.getTeachers(),
        apiClient.getAllUsers({ role: 'student' }),
        apiClient.getAdminSections() // NEW: Load all sections
      ])

      console.log('API Responses:', { statsRes, coursesRes, teachersRes, studentsRes, sectionsRes })
      console.log('📋 Sections loaded:', (sectionsRes.data as any)?.length || 0, 'sections')

      if (statsRes.success) {
        const statsData = statsRes.data as any
        const mappedStats: AdminStats = {
          users: {
            total: statsData.users?.reduce((acc: number, user: any) => acc + user.count, 0) || 0,
            students: statsData.users?.find((u: any) => u.role === 'student')?.count || 0,
            teachers: statsData.users?.find((u: any) => u.role === 'teacher')?.count || 0,
            admins: statsData.users?.find((u: any) => u.role === 'admin')?.count || 0,
            new_this_week: statsData.recent_activity?.new_users_week || 0
          },
          courses: {
            total: statsData.courses?.total_courses || 0,
            with_teachers: statsData.courses?.courses_with_teachers || 0,
            without_teachers: (statsData.courses?.total_courses || 0) - (statsData.courses?.courses_with_teachers || 0),
            new_this_week: statsData.recent_activity?.new_courses_week || 0
          },
          materials: {
            total: statsData.materials?.total_materials || 0
          },
          recent_activity: {
            new_users_last_7_days: statsData.recent_activity?.new_users_week || 0,
            new_courses_last_7_days: statsData.recent_activity?.new_courses_week || 0
          }
        }
        setStats(mappedStats)
      }
      if (coursesRes.success) {
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data as any)?.courses || []
        setCourses(coursesData as Course[])
      }
      if (teachersRes.success) {
        const teachersData = Array.isArray(teachersRes.data) ? teachersRes.data : (teachersRes.data as any)?.teachers || []
        setTeachers(teachersData as Teacher[])
      }
      if (studentsRes.success) {
        const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data as any)?.users || []
        setStudents(studentsData as User[])
      }
      if (sectionsRes.success) {
        const sectionsData = (sectionsRes.data as any) || []
        console.log('✅ Setting sections state:', sectionsData)
        setSections(sectionsData)
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
    }
    setLoading(false)
    console.log('✅ loadAdminData complete')
  }

  const loadCalendarEvents = async () => {
    try {
      const response = await apiClient.getAdminCalendar()
      if (response.success && response.data) {
        const data = response.data as any
        const eventsData = data.events || []
        
        // Transform the API response to match the CalendarEvent interface
        const transformedEvents = eventsData.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          date: new Date(event.date),
          type: event.type,
          courseId: event.course_code,
          description: event.description,
          status: event.status,
          courseName: event.course_name,
          courseColor: event.course_color,
          priority: event.priority
        }))
        
        setCalendarEvents(transformedEvents)
      }
    } catch (error) {
      console.error('Error loading calendar events:', error)
    }
  }

  const handleCreateUniversityEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.createUniversityEvent({
        title: newUniversityEvent.title,
        description: newUniversityEvent.description,
        date: new Date(newUniversityEvent.date).toISOString(),
        type: newUniversityEvent.type,
        priority: newUniversityEvent.priority
      })

      if (response.success) {
        setNewUniversityEvent({
          title: '',
          description: '',
          date: '',
          type: 'event',
          priority: 'normal'
        })
        loadCalendarEvents()
        toast({
          title: "Success",
          description: "University event created successfully!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create university event",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create university event",
        variant: "destructive"
      })
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Profile and detail view handlers
  const handleViewTeacherProfile = async (teacherId: string) => {
    try {
      const response = await apiClient.getTeacherProfile(teacherId)
      if (response.success) {
        setSelectedTeacherProfile(response.data)
        setTeacherModalOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load teacher profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teacher profile",
        variant: "destructive"
      })
    }
  }

  const handleViewStudentProfile = async (studentId: string) => {
    try {
      const response = await apiClient.getStudentProfile(studentId)
      if (response.success) {
        setSelectedStudentProfile(response.data)
        setStudentModalOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load student profile",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load student profile",
        variant: "destructive"
      })
    }
  }

  const handleViewCourseDetails = async (courseId: string) => {
    try {
      const response = await apiClient.getCourseDetails(courseId)
      if (response.success) {
        setSelectedCourseDetails(response.data)
        setCourseModalOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive"
      })
    }
  }

  const handleViewSectionStudents = async (sectionId: string) => {
    try {
      const response = await apiClient.getSectionDetails(sectionId)
      if (response.success) {
        setSelectedSectionStudents(response.data)
        setSectionStudentsModalOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load section students",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load section students",
        variant: "destructive"
      })
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.createAdminCourse(newCourse)
      if (response.success) {
        setNewCourse({
          course_name: '',
          course_code: '',
          description: '',
          credits: 3,
          semester: 'Fall' as 'Fall' | 'Spring' | 'Summer',
          academic_year: '2024-2025'
        })
        loadAdminData() // Reload data
        toast({
          title: "Success",
          description: "Course created successfully!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create course",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      })
    }
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.createTeacher(newTeacher)
      if (response.success) {
        setNewTeacher({
          name: '',
          email: '',
          password: ''
        })
        loadAdminData()
        toast({
          title: "Success",
          description: "Teacher account created successfully!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create teacher",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create teacher",
        variant: "destructive"
      })
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.createStudent(newStudent)
      if (response.success) {
        setNewStudent({
          name: '',
          email: '',
          password: ''
        })
        loadAdminData()
        toast({
          title: "Success",
          description: "Student account created successfully!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create student",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const response = await apiClient.deleteAdminCourse(courseId.toString())
        if (response.success) {
          loadAdminData() // Reload data
          toast({
            title: "Success",
            description: "Course deleted successfully!",
            className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
          })
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete course",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive"
        })
      }
    }
  }

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacherId || !selectedSectionId) return
    
    try {
      const response = await apiClient.assignTeacherToSection(selectedSectionId, parseInt(selectedTeacherId))
      if (response.success) {
        setSelectedTeacherId('')
        setSelectedSectionId('')
        loadAdminData() // Reload data
        toast({
          title: "Success",
          description: "Teacher assigned to section successfully!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign teacher",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign teacher",
        variant: "destructive"
      })
    }
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !selectedSectionId) return
    
    try {
      console.log('Enrolling student:', { studentId: selectedStudentId, sectionId: selectedSectionId })
      const response = await apiClient.enrollStudent(selectedStudentId, selectedSectionId)
      console.log('Enroll response:', response)
      
      if (response.success) {
        setSelectedStudentId('')
        setSelectedSectionId('')
        loadAdminData() // Reload data
        toast({
          title: "Success",
          description: response.message || "Student enrolled in section successfully!",
          className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || response.error || "Failed to enroll student",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Enroll error:', error)
      toast({
        title: "Error",
        description: `Network error: ${error}`,
        variant: "destructive"
      })
    }
  }



  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glassmorphic border-b border-white/10 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Administrator Panel</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="glassmorphic">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
            <Button variant="ghost" size="sm" onClick={loadAdminData} className="glassmorphic">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-400">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glassmorphic" align="end">
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{user?.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 glassmorphic">
            <TabsTrigger value="stats" className="glassmorphic hover:glow-cyan">
              <Calendar className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="calendar" className="glassmorphic hover:glow-blue">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="sections" className="glassmorphic hover:glow-orange">
              <Layers className="w-4 h-4 mr-2" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="courses" className="glassmorphic hover:glow-purple">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="teachers" className="glassmorphic hover:glow-green">
              <Users className="w-4 h-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="students" className="glassmorphic hover:glow-yellow">
              <School className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glassmorphic">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-cyan-400" />
                      Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{stats.users.total}</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Students: {stats.users.students}</p>
                        <p>Teachers: {stats.users.teachers}</p>
                        <p>Admins: {stats.users.admins}</p>
                        <p>New this week: {stats.users.new_this_week}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphic">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                      Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{stats.courses.total}</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>With teachers: {stats.courses.with_teachers}</p>
                        <p>Without teachers: {stats.courses.without_teachers}</p>
                        <p>New this week: {stats.courses.new_this_week}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphic">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <School className="w-5 h-5 mr-2 text-green-400" />
                      Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{stats.materials.total}</p>
                      <p className="text-sm text-muted-foreground">Total materials uploaded</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glassmorphic">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>New users (7 days): {stats.recent_activity.new_users_last_7_days}</p>
                        <p>New courses (7 days): {stats.recent_activity.new_courses_last_7_days}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="h-[calc(100vh-160px)]">
            <div className="flex h-full gap-4">
              {/* Left Side - Events List (20%) */}
              <div className="w-1/5">
                <Card className="glassmorphic h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm">
                      <CalendarDays className="w-4 h-4 mr-2 text-purple-400" />
                      All Events
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {calendarEvents.length} events total
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 h-[calc(100%-80px)] overflow-y-auto">
                    <div className="space-y-2 max-h-full overflow-y-auto">
                      {calendarEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          No events scheduled
                        </p>
                      ) : (
                        calendarEvents
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((event, index) => (
                            <div key={index} className="p-2 glassmorphic rounded-lg border border-white/10">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  event.type === 'assignment' ? 'bg-red-400' :
                                  event.type === 'university_event' || event.type === 'holiday' || event.type === 'exam_week' ? 'bg-blue-400' :
                                  'bg-yellow-400'
                                }`} />
                                <span className="text-xs font-medium text-foreground truncate">
                                  {event.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {event.date.toLocaleDateString()}
                              </p>
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle - Calendar (50%) */}
              <div className="w-1/2">
                <Card className="glassmorphic h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      University Calendar
                    </CardTitle>
                    <CardDescription className="text-xs">
                      System-wide events and important dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 h-[calc(100%-80px)] overflow-hidden">
                    <CalendarPanel events={calendarEvents} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Create Event Form (30%) */}
              <div className="w-3/10 flex-shrink-0" style={{width: '30%'}}>
                <Card className="glassmorphic h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm">
                      <Plus className="w-4 h-4 mr-2 text-orange-400" />
                      Create University Event
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Add important dates and announcements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 h-[calc(100%-80px)] overflow-y-auto">
                    <form onSubmit={handleCreateUniversityEvent} className="space-y-3">
                      <Input
                        placeholder="Event Title (e.g., Winter Break)"
                        value={newUniversityEvent.title}
                        onChange={(e) => setNewUniversityEvent({...newUniversityEvent, title: e.target.value})}
                        className="glassmorphic text-sm"
                        required
                      />

                      <Input
                        type="datetime-local"
                        value={newUniversityEvent.date}
                        onChange={(e) => setNewUniversityEvent({...newUniversityEvent, date: e.target.value})}
                        className="glassmorphic text-sm"
                        required
                      />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between glassmorphic text-sm h-9">
                            {newUniversityEvent.type.charAt(0).toUpperCase() + newUniversityEvent.type.slice(1).replace('_', ' ')}
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glassmorphic">
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'holiday'})}>
                            Holiday
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'exam_week'})}>
                            Exam Week
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'registration'})}>
                            Registration
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'orientation'})}>
                            Orientation
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'graduation'})}>
                            Graduation
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'maintenance'})}>
                            Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, type: 'event'})}>
                            General Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between glassmorphic text-sm h-9">
                            {newUniversityEvent.priority.charAt(0).toUpperCase() + newUniversityEvent.priority.slice(1)} Priority
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glassmorphic">
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, priority: 'low'})}>
                            Low Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, priority: 'normal'})}>
                            Normal Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewUniversityEvent({...newUniversityEvent, priority: 'high'})}>
                            High Priority
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Textarea
                        placeholder="Event description and details..."
                        value={newUniversityEvent.description}
                        onChange={(e) => setNewUniversityEvent({...newUniversityEvent, description: e.target.value})}
                        className="glassmorphic text-sm"
                        rows={3}
                      />

                      <Button type="submit" className="w-full glassmorphic hover:glow-orange text-sm h-9">
                        <Plus className="w-3 h-3 mr-2" />
                        Create University Event
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <SimpleSectionManagement onSectionChange={loadAdminData} />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* Create Course Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-cyan-400" />
                  Create New Course
                </CardTitle>
                <CardDescription>
                  Add a new course to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Course name"
                    value={newCourse.course_name}
                    onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})}
                    className="glassmorphic border-white/20"
                    required
                  />
                  <Input
                    placeholder="Course code (e.g., CSE-401)"
                    value={newCourse.course_code}
                    onChange={(e) => setNewCourse({...newCourse, course_code: e.target.value})}
                    className="glassmorphic border-white/20"
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="glassmorphic border-white/20"
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Credits"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                    className="glassmorphic border-white/20"
                    required
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between glassmorphic">
                        {newCourse.semester || "Select Semester"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full">
                      <DropdownMenuItem onClick={() => setNewCourse({...newCourse, semester: 'Fall'})}>
                        Fall
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewCourse({...newCourse, semester: 'Spring'})}>
                        Spring
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewCourse({...newCourse, semester: 'Summer'})}>
                        Summer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input
                    placeholder="Academic Year (e.g., 2024-2025)"
                    value={newCourse.academic_year}
                    onChange={(e) => setNewCourse({...newCourse, academic_year: e.target.value})}
                    className="glassmorphic border-white/20"
                    pattern="\d{4}-\d{4}"
                    required
                  />
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full glassmorphic hover:glow-cyan">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Existing Courses */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Existing Courses</CardTitle>
                <CardDescription>
                  {courses?.length || 0} courses in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses && courses.length > 0 ? courses.map((course) => {
                    // Get sections for this course
                    const courseSections = sections.filter((s: any) => s.course_id === course.id)
                    
                    return (
                      <div key={course.id} className="glassmorphic p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{course.course_name}</h3>
                            <p className="text-sm text-muted-foreground">{course.course_code}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="glassmorphic hover:glow-blue"
                              onClick={() => handleViewCourseDetails(course.id.toString())}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="glassmorphic hover:glow-red"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Credits: </span>
                            {course.credits}
                          </div>
                          <div>
                            <span className="font-medium">Semester: </span>
                            {course.semester}
                          </div>
                          <div>
                            <span className="font-medium">Sections: </span>
                            {courseSections.length}
                          </div>
                          <div>
                            <span className="font-medium">Total Students: </span>
                            {courseSections.reduce((acc: number, s: any) => acc + (s.current_enrollment || 0), 0)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{course.description}</p>
                        
                        {/* Sections under this course */}
                        {courseSections.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                              <Layers className="w-4 h-4 mr-2 text-cyan-400" />
                              Sections ({courseSections.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {courseSections.map((section: any) => (
                                <div key={section.id} className="text-xs bg-black/20 p-2 rounded border border-white/5 hover:border-white/10 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-foreground">{section.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">{section.current_enrollment}/{section.max_capacity}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewSectionStudents(section.id.toString())}
                                        className="h-6 w-6 p-0 hover:bg-white/10"
                                        title="View enrolled students"
                                      >
                                        <Eye className="h-3 w-3 text-cyan-400" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="text-muted-foreground">
                                    Teacher: {section.teacher_name || "Not assigned"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    <p className="text-center text-muted-foreground py-8">No courses found. Create your first course above.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            {/* Create Teacher Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-400" />
                  Create New Teacher
                </CardTitle>
                <CardDescription>
                  Add a new teacher to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    className="glassmorphic"
                    required
                  />
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    className="glassmorphic"
                    required
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                    className="glassmorphic"
                    required
                  />
                  <div className="md:col-span-3">
                    <Button type="submit" className="w-full glassmorphic hover:glow-blue">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Teacher Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Assign Teacher Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-green-400" />
                  Assign Teacher to Section
                </CardTitle>
                <CardDescription>
                  Assign a teacher to a course section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssignTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between glassmorphic">
                        {selectedTeacherId ? teachers?.find(t => t.id.toString() === selectedTeacherId)?.name : "Select Teacher"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full">
                      {teachers?.map((teacher) => (
                        <DropdownMenuItem
                          key={teacher.id}
                          onClick={() => setSelectedTeacherId(teacher.id.toString())}
                        >
                          {teacher.name} ({teacher.email})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between glassmorphic">
                        {selectedSectionId 
                          ? `${sections.find((s: any) => s.id.toString() === selectedSectionId)?.course_code} - ${sections.find((s: any) => s.id.toString() === selectedSectionId)?.name}`
                          : "Select Section"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full max-h-60 overflow-y-auto">
                      {sections.map((section: any) => (
                        <DropdownMenuItem
                          key={section.id}
                          onClick={() => setSelectedSectionId(section.id.toString())}
                        >
                          {section.course_code} - {section.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full glassmorphic hover:glow-green" disabled={!selectedTeacherId || !selectedSectionId}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Teacher
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Teachers List */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Teacher Management</CardTitle>
                <CardDescription>
                  {teachers?.length || 0} teachers in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teachers && teachers.length > 0 ? teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 glassmorphic rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                            {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{teacher.course_count || 0} courses</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewTeacherProfile(teacher.id.toString())}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No teachers found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {/* Create Student Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-purple-400" />
                  Create New Student
                </CardTitle>
                <CardDescription>
                  Add a new student to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="glassmorphic"
                    required
                  />
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="glassmorphic"
                    required
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                    className="glassmorphic"
                    required
                  />
                  <div className="md:col-span-3">
                    <Button type="submit" className="w-full glassmorphic hover:glow-purple">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Student Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Enroll Student Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-yellow-400" />
                  Enroll Student in Section
                </CardTitle>
                <CardDescription>
                  Enroll a student in a course section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEnrollStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between glassmorphic">
                        {selectedStudentId ? students?.find(s => s.id.toString() === selectedStudentId)?.name : "Select Student"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full max-h-60 overflow-y-auto">
                      {students?.map((student) => (
                        <DropdownMenuItem
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id.toString())}
                        >
                          {student.name} ({student.email})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between glassmorphic">
                        {selectedSectionId 
                          ? `${sections.find((s: any) => s.id.toString() === selectedSectionId)?.course_code} - ${sections.find((s: any) => s.id.toString() === selectedSectionId)?.name}`
                          : "Select Section"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full max-h-60 overflow-y-auto">
                      {sections.map((section: any) => (
                        <DropdownMenuItem
                          key={section.id}
                          onClick={() => setSelectedSectionId(section.id.toString())}
                        >
                          {section.course_code} - {section.name} ({section.current_enrollment}/{section.max_capacity})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full glassmorphic hover:glow-yellow" disabled={!selectedStudentId || !selectedSectionId}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Enroll Student
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Students List */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  {students?.length || 0} students in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students && students.length > 0 ? students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 glassmorphic rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Role: {student.role}</p>
                          <p>ID: {student.id}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewStudentProfile(student.id.toString())}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No students found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Teacher Profile Modal */}
      <Dialog open={teacherModalOpen} onOpenChange={setTeacherModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
          </DialogHeader>
          {selectedTeacherProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 text-lg">
                    {selectedTeacherProfile.teacher.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTeacherProfile.teacher.name}</h3>
                  <p className="text-muted-foreground flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {selectedTeacherProfile.teacher.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Member since: {new Date(selectedTeacherProfile.teacher.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Assigned Courses ({selectedTeacherProfile.courses?.length || 0})</h4>
                {selectedTeacherProfile.courses && selectedTeacherProfile.courses.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTeacherProfile.courses.map((course: any) => (
                      <div key={course.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{course.course_name}</h5>
                            <p className="text-sm text-muted-foreground">{course.course_code}</p>
                            <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p>{course.credits} credits</p>
                            <p>{course.semester} {course.academic_year}</p>
                            <Badge variant="outline">{course.student_count} students</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No courses assigned</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Modal */}
      <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudentProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 text-lg">
                    {selectedStudentProfile.student.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudentProfile.student.name}</h3>
                  <p className="text-muted-foreground flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {selectedStudentProfile.student.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Member since: {new Date(selectedStudentProfile.student.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Enrolled Courses ({selectedStudentProfile.courses?.length || 0})</h4>
                {selectedStudentProfile.courses && selectedStudentProfile.courses.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudentProfile.courses.map((course: any) => (
                      <div key={course.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{course.course_name}</h5>
                            <p className="text-sm text-muted-foreground">{course.course_code}</p>
                            <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                            {course.teacher_name && (
                              <p className="text-xs text-muted-foreground">Teacher: {course.teacher_name}</p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <p>{course.credits} credits</p>
                            <p>{course.semester} {course.academic_year}</p>
                            <p className="text-xs">Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No courses enrolled</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Details Modal */}
      <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourseDetails && (
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCourseDetails.course.course_name}</h3>
                    <p className="text-muted-foreground">{selectedCourseDetails.course.course_code}</p>
                    <p className="text-sm mt-2">{selectedCourseDetails.course.description}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Credits:</span> {selectedCourseDetails.course.credits}</p>
                    <p><span className="font-medium">Semester:</span> {selectedCourseDetails.course.semester} {selectedCourseDetails.course.academic_year}</p>
                    <p><span className="font-medium">Teacher:</span> {selectedCourseDetails.course.teacher_name || 'Not assigned'}</p>
                    <p><span className="font-medium">Created:</span> {new Date(selectedCourseDetails.course.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Enrolled Students ({selectedCourseDetails.students?.length || 0})</h4>
                {selectedCourseDetails.students && selectedCourseDetails.students.length > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200 dark:border-gray-600 font-medium text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Enrolled Date</div>
                      <div>Actions</div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {selectedCourseDetails.students.map((student: any) => (
                        <div key={student.id} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 text-xs">
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                          </div>
                          <div>{student.email}</div>
                          <div>{new Date(student.enrolled_at).toLocaleDateString()}</div>
                          <div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewStudentProfile(student.id.toString())}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No students enrolled</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Section Students Modal */}
      <Dialog open={sectionStudentsModalOpen} onOpenChange={setSectionStudentsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glassmorphic">
          <DialogHeader>
            <DialogTitle>Section Students</DialogTitle>
          </DialogHeader>
          {selectedSectionStudents && (
            <div className="space-y-4">
              <div className="p-4 glassmorphic rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedSectionStudents.course_code} - {selectedSectionStudents.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSectionStudents.course_title}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="font-medium">Teacher:</span> {selectedSectionStudents.teacher_name || 'Not assigned'}
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span> {selectedSectionStudents.current_enrollment}/{selectedSectionStudents.max_capacity}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Enrolled Students ({selectedSectionStudents.students?.length || 0})</h4>
                {selectedSectionStudents.students && selectedSectionStudents.students.length > 0 ? (
                  <div className="border border-white/10 rounded-lg glassmorphic overflow-hidden">
                    <div className="grid grid-cols-3 gap-4 p-3 border-b border-white/10 font-medium text-sm bg-white/5">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Enrolled Date</div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {selectedSectionStudents.students.map((student: any) => (
                        <div key={student.id} className="grid grid-cols-3 gap-4 p-3 border-b border-white/5 last:border-b-0 text-sm hover:bg-white/5 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 text-xs">
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <div className="text-muted-foreground">{student.email}</div>
                          <div className="text-muted-foreground">{new Date(student.enrolled_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 glassmorphic rounded-lg border border-white/10">
                    No students enrolled in this section yet
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}

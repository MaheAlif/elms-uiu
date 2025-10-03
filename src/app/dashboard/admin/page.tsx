"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
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
  UserCheck,
  UserX,
  Loader2,
  RefreshCw
} from "lucide-react"

function AdminDashboardContent() {
  // State management
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
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
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const router = useRouter()
  const { user, logout } = useAuth()

  // Load data on component mount
  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [statsRes, coursesRes, teachersRes, studentsRes] = await Promise.all([
        apiClient.getAdminStats(),
        apiClient.getAdminCourses(),
        apiClient.getTeachers(),
        apiClient.getAllUsers({ role: 'student' })
      ])

      console.log('API Responses:', { statsRes, coursesRes, teachersRes, studentsRes })

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
    } catch (error) {
      console.error('Failed to load admin data:', error)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
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
      }
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const response = await apiClient.deleteAdminCourse(courseId.toString())
        if (response.success) {
          loadAdminData() // Reload data
        }
      } catch (error) {
        console.error('Failed to delete course:', error)
      }
    }
  }

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacherId || !selectedCourseId) return
    
    try {
      const response = await apiClient.assignTeacher(selectedTeacherId, selectedCourseId)
      if (response.success) {
        setSelectedTeacherId('')
        setSelectedCourseId('')
        loadAdminData() // Reload data
      }
    } catch (error) {
      console.error('Failed to assign teacher:', error)
    }
  }

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !selectedCourseId) return
    
    try {
      const response = await apiClient.enrollStudent(selectedStudentId, selectedCourseId)
      if (response.success) {
        setSelectedStudentId('')
        setSelectedCourseId('')
        loadAdminData() // Reload data
      }
    } catch (error) {
      console.error('Failed to enroll student:', error)
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
          <TabsList className="grid w-full grid-cols-4 glassmorphic">
            <TabsTrigger value="stats" className="glassmorphic hover:glow-cyan">
              <Calendar className="w-4 h-4 mr-2" />
              Statistics
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
                  {courses && courses.length > 0 ? courses.map((course) => (
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
                          <span className="font-medium">Teacher: </span>
                          {course.teacher_name || 'Not assigned'}
                        </div>
                        <div>
                          <span className="font-medium">Students: </span>
                          {course.student_count || 0}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{course.description}</p>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No courses found. Create your first course above.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            {/* Assign Teacher Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-green-400" />
                  Assign Teacher to Course
                </CardTitle>
                <CardDescription>
                  Assign a teacher to a course
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
                        {selectedCourseId ? courses.find(c => c.id.toString() === selectedCourseId)?.course_name : "Select Course"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full">
                      {courses.map((course) => (
                        <DropdownMenuItem
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id.toString())}
                        >
                          {course.course_name} ({course.course_code})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full glassmorphic hover:glow-green" disabled={!selectedTeacherId || !selectedCourseId}>
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
            {/* Enroll Student Form */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-yellow-400" />
                  Enroll Student in Course
                </CardTitle>
                <CardDescription>
                  Enroll a student in a course
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
                        {selectedCourseId ? courses.find(c => c.id.toString() === selectedCourseId)?.course_name : "Select Course"}
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glassmorphic w-full">
                      {courses.map((course) => (
                        <DropdownMenuItem
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id.toString())}
                        >
                          {course.course_name} ({course.course_code})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full glassmorphic hover:glow-yellow" disabled={!selectedStudentId || !selectedCourseId}>
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

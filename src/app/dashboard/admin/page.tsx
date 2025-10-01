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
// AlertDialog component not available, using window.confirm
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
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
  UserX
} from "lucide-react"

// Mock data for admin
const mockCourses = [
  {
    id: '1',
    title: 'Advanced React Development',
    sections: ['CSE-401-A', 'CSE-401-B'],
    teachers: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
    totalStudents: 83,
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    sections: ['CSE-402-A', 'CSE-402-B'],
    teachers: ['Prof. Michael Chen', 'Dr. Emily Davis'],
    totalStudents: 76,
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: '3',
    title: 'Database Design & SQL',
    sections: ['CSE-301-A', 'CSE-301-B', 'CSE-301-C'],
    teachers: ['Dr. Sarah Johnson', 'Prof. Robert Wilson'],
    totalStudents: 124,
    color: 'from-green-500/20 to-emerald-500/20'
  }
]

const mockTeachers = [
  { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@elms.edu', courses: 2, students: 97 },
  { id: '2', name: 'Prof. Michael Chen', email: 'michael.chen@elms.edu', courses: 2, students: 76 },
  { id: '3', name: 'Dr. Emily Davis', email: 'emily.davis@elms.edu', courses: 1, students: 38 },
  { id: '4', name: 'Prof. Robert Wilson', email: 'robert.wilson@elms.edu', courses: 1, students: 52 }
]

const mockStudents = [
  { id: '1', name: 'Alice Johnson', email: 'alice@student.elms.edu', courses: 3, section: 'CSE-401-A' },
  { id: '2', name: 'Bob Smith', email: 'bob@student.elms.edu', courses: 2, section: 'CSE-402-B' },
  { id: '3', name: 'Carol Davis', email: 'carol@student.elms.edu', courses: 4, section: 'CSE-301-C' },
  { id: '4', name: 'David Wilson', email: 'david@student.elms.edu', courses: 3, section: 'CSE-401-B' }
]

function AdminDashboardContent() {
  const [newCourseName, setNewCourseName] = useState('')
  const [newSectionName, setNewSectionName] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating course:', newCourseName)
    setNewCourseName('')
  }

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating section:', newSectionName, 'for course:', selectedCourse)
    setNewSectionName('')
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
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glassmorphic">
            <TabsTrigger value="courses" className="glassmorphic hover:glow-cyan">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="teachers" className="glassmorphic hover:glow-purple">
              <Users className="w-4 h-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="students" className="glassmorphic hover:glow-green">
              <School className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="assignments" className="glassmorphic hover:glow-yellow">
              <UserPlus className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Course */}
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
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <Input
                      placeholder="Course name (e.g., Advanced React Development)"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="glassmorphic border-white/20"
                      required
                    />
                    <Button type="submit" className="w-full glassmorphic hover:glow-cyan">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Create Section */}
              <Card className="glassmorphic">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-purple-400" />
                    Create New Section
                  </CardTitle>
                  <CardDescription>
                    Add a section to an existing course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSection} className="space-y-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between glassmorphic">
                          {selectedCourse ? mockCourses.find(c => c.id === selectedCourse)?.title : "Select Course"}
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glassmorphic w-full">
                        {mockCourses.map((course) => (
                          <DropdownMenuItem
                            key={course.id}
                            onClick={() => setSelectedCourse(course.id)}
                          >
                            {course.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                      placeholder="Section name (e.g., CSE-401-C)"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      className="glassmorphic border-white/20"
                      required
                    />
                    <Button type="submit" className="w-full glassmorphic hover:glow-purple">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Section
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Existing Courses */}
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Existing Courses</CardTitle>
                <CardDescription>
                  {mockCourses.length} courses with {mockCourses.reduce((acc, course) => acc + course.sections.length, 0)} sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCourses.map((course) => (
                    <div key={course.id} className="glassmorphic p-4 rounded-lg">
                      <div className={`w-full h-2 bg-gradient-to-r ${course.color} rounded-full mb-3`} />
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="glassmorphic hover:glow-blue">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="glassmorphic hover:glow-red"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
                                console.log('Deleting course:', course.id)
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Sections: </span>
                          {course.sections.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Students: </span>
                          {course.totalStudents}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Teacher Management</CardTitle>
                <CardDescription>
                  {mockTeachers.length} teachers in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTeachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 glassmorphic rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{teacher.courses} courses</p>
                          <p>{teacher.students} students</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="glassmorphic">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glassmorphic">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Assign to Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserX className="w-4 h-4 mr-2" />
                              Remove from Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Teacher
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  {mockStudents.length} students enrolled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 glassmorphic rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Section: {student.section}</p>
                          <p>{student.courses} courses</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="glassmorphic">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glassmorphic">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Enroll in Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Change Section
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserX className="w-4 h-4 mr-2" />
                              Remove from Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glassmorphic">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full glassmorphic hover:glow-cyan justify-start">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Teacher to Section
                  </Button>
                  <Button className="w-full glassmorphic hover:glow-purple justify-start">
                    <School className="w-4 h-4 mr-2" />
                    Enroll Student in Section
                  </Button>
                  <Button className="w-full glassmorphic hover:glow-green justify-start">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Transfer Student
                  </Button>
                  <Button className="w-full glassmorphic hover:glow-yellow justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Bulk Operations
                  </Button>
                </CardContent>
              </Card>

              <Card className="glassmorphic">
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                  <CardDescription>Overview of the ELMS system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 glassmorphic rounded-lg">
                      <span className="text-foreground">Total Courses</span>
                      <Badge variant="secondary">{mockCourses.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 glassmorphic rounded-lg">
                      <span className="text-foreground">Total Sections</span>
                      <Badge variant="secondary">{mockCourses.reduce((acc, course) => acc + course.sections.length, 0)}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 glassmorphic rounded-lg">
                      <span className="text-foreground">Total Teachers</span>
                      <Badge variant="secondary">{mockTeachers.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 glassmorphic rounded-lg">
                      <span className="text-foreground">Total Students</span>
                      <Badge variant="secondary">{mockCourses.reduce((acc, course) => acc + course.totalStudents, 0)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

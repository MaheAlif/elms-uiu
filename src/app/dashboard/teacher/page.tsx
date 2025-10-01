"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { 
  LogOut, 
  Settings, 
  User as UserIcon, 
  GraduationCap,
  BookOpen,
  Upload,
  Link,
  FileText,
  Users,
  Plus,
  Calendar,
  MessageCircle
} from "lucide-react"

// Mock data for teacher
const mockTeacherCourses = [
  {
    id: '1',
    title: 'Advanced React Development',
    section: 'CSE-401-A',
    students: 45,
    materials: 12,
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    section: 'CSE-402-B',
    students: 38,
    materials: 8,
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: '3',
    title: 'Database Design & SQL',
    section: 'CSE-301-C',
    students: 52,
    materials: 15,
    color: 'from-green-500/20 to-emerald-500/20'
  }
]

function TeacherDashboardContent() {
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')
  const [materialLink, setMaterialLink] = useState('')
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    setSelectedCourse(mockTeacherCourses[0]?.id || '')
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleMaterialUpload = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock upload logic
    console.log('Uploading material:', { materialTitle, materialDescription, materialLink, courseId: selectedCourse })
    // Reset form
    setMaterialTitle('')
    setMaterialDescription('')
    setMaterialLink('')
  }



  const selectedCourseData = mockTeacherCourses.find(course => course.id === selectedCourse)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glassmorphic border-b border-white/10 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="glassmorphic">
              <Users className="w-3 h-3 mr-1" />
              Teacher
            </Badge>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Course List */}
        <div className="w-1/3 border-r border-white/10 glassmorphic p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
              My Courses & Sections
            </h2>
            <p className="text-sm text-muted-foreground">
              {mockTeacherCourses.length} courses assigned
            </p>
          </div>

          <div className="space-y-4">
            {mockTeacherCourses.map((course) => (
              <Card
                key={course.id}
                className={`glassmorphic cursor-pointer transition-all duration-200 ${
                  selectedCourse === course.id 
                    ? 'glow-cyan border-cyan-500/30' 
                    : 'hover:glow-purple border-white/10'
                }`}
                onClick={() => setSelectedCourse(course.id)}
              >
                <CardContent className="p-4">
                  <div className={`w-full h-2 bg-gradient-to-r ${course.color} rounded-full mb-3`} />
                  <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.section}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {course.students} students
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {course.materials} materials
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel - Material Management */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedCourseData && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {selectedCourseData.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Section: {selectedCourseData.section} • {selectedCourseData.students} enrolled students
                </p>
              </div>

              <Tabs defaultValue="upload" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 glassmorphic">
                  <TabsTrigger value="upload" className="glassmorphic hover:glow-cyan">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Material
                  </TabsTrigger>
                  <TabsTrigger value="materials" className="glassmorphic hover:glow-purple">
                    <FileText className="w-4 h-4 mr-2" />
                    Materials
                  </TabsTrigger>
                  <TabsTrigger value="students" className="glassmorphic hover:glow-green">
                    <Users className="w-4 h-4 mr-2" />
                    Students
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <Card className="glassmorphic">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-cyan-400" />
                        Post New Material
                      </CardTitle>
                      <CardDescription>
                        Upload files or add external links for your students
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleMaterialUpload} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Material Title
                          </label>
                          <Input
                            placeholder="e.g., React Hooks Deep Dive"
                            value={materialTitle}
                            onChange={(e) => setMaterialTitle(e.target.value)}
                            className="glassmorphic border-white/20"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Description
                          </label>
                          <textarea
                            placeholder="Brief description of the material..."
                            value={materialDescription}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMaterialDescription(e.target.value)}
                            className="glassmorphic border-white/20 w-full rounded-md px-3 py-2 text-sm bg-background/50 backdrop-blur-sm border focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            File Upload or External Link
                          </label>
                          <div className="space-y-3">
                            <Input
                              type="file"
                              accept=".pdf,.pptx,.docx,.mp4,.mov"
                              className="glassmorphic border-white/20"
                            />
                            <div className="text-center text-muted-foreground text-sm">OR</div>
                            <Input
                              placeholder="https://youtube.com/watch?v=... or other educational link"
                              value={materialLink}
                              onChange={(e) => setMaterialLink(e.target.value)}
                              className="glassmorphic border-white/20"
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full glassmorphic hover:glow-green">
                          <Upload className="w-4 h-4 mr-2" />
                          Post Material
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="materials">
                  <Card className="glassmorphic">
                    <CardHeader>
                      <CardTitle>Course Materials</CardTitle>
                      <CardDescription>
                        {selectedCourseData.materials} materials posted
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 glassmorphic rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="font-medium text-foreground">React Hooks Deep Dive</p>
                              <p className="text-xs text-muted-foreground">Posted 2 days ago • PDF • 2.5 MB</p>
                            </div>
                          </div>
                          <Badge variant="secondary">PDF</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 glassmorphic rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Link className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-foreground">Advanced Patterns Tutorial</p>
                              <p className="text-xs text-muted-foreground">Posted 1 week ago • YouTube Link</p>
                            </div>
                          </div>
                          <Badge variant="secondary">LINK</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="students">
                  <Card className="glassmorphic">
                    <CardHeader>
                      <CardTitle>Enrolled Students</CardTitle>
                      <CardDescription>
                        {selectedCourseData.students} students in this section
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3 glassmorphic rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                                S{i + 1}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">Student {i + 1}</p>
                              <p className="text-xs text-muted-foreground">student{i + 1}@elms.edu</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <TeacherDashboardContent />
    </ProtectedRoute>
  )
}

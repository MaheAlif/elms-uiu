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
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
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
  MessageCircle,
  Loader2
} from "lucide-react"

// Course colors for visual variety
const courseColors = [
  'from-cyan-500/20 to-blue-500/20',
  'from-purple-500/20 to-pink-500/20',
  'from-green-500/20 to-emerald-500/20',
  'from-orange-500/20 to-red-500/20',
  'from-yellow-500/20 to-orange-500/20',
  'from-indigo-500/20 to-purple-500/20'
]

function TeacherDashboardContent() {
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [courseDetails, setCourseDetails] = useState<any>(null)
  const [materials, setMaterials] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')
  const [materialLink, setMaterialLink] = useState('')
  const [uploadingMaterial, setUploadingMaterial] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  // Load teacher's courses
  useEffect(() => {
    loadTeacherCourses()
  }, [])

  // Load details when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadCourseDetails(selectedCourse)
      loadCourseMaterials(selectedCourse)
      loadCourseStudents(selectedCourse)
    }
  }, [selectedCourse])

  const loadTeacherCourses = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTeacherCourses()
      
      if (response.success && response.data) {
        const coursesWithColors = response.data.courses.map((course: any, index: number) => ({
          ...course,
          color: courseColors[index % courseColors.length]
        }))
        setCourses(coursesWithColors)
        
        // Select first course by default
        if (coursesWithColors.length > 0) {
          setSelectedCourse(coursesWithColors[0].id.toString())
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCourseDetails = async (courseId: string) => {
    try {
      const response = await apiClient.getTeacherCourseDetails(courseId)
      if (response.success && response.data) {
        setCourseDetails(response.data.course)
        setSections(response.data.sections || [])
      }
    } catch (error) {
      console.error('Error loading course details:', error)
    }
  }

  const loadCourseMaterials = async (courseId: string) => {
    try {
      const response = await apiClient.getTeacherMaterials(courseId)
      if (response.success && response.data) {
        setMaterials(response.data.materials || [])
      }
    } catch (error) {
      console.error('Error loading materials:', error)
    }
  }

  const loadCourseStudents = async (courseId: string) => {
    try {
      const response = await apiClient.getTeacherStudents(courseId)
      if (response.success && response.data) {
        setStudents(response.data.students || [])
      }
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCourse || (!materialTitle.trim() && !materialLink.trim())) {
      toast({
        title: "Error", 
        description: "Please provide a title and either a file or link",
        variant: "destructive",
      })
      return
    }

    // Check if we have sections for this course
    if (sections.length === 0) {
      toast({
        title: "Error",
        description: "No sections available for this course. Create a section first.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingMaterial(true)
      
      const formData = new FormData()
      formData.append('section_id', sections[0].id.toString()) // Use first section for now
      formData.append('title', materialTitle)
      formData.append('type', 'pdf') // Default type, can be enhanced later
      
      // Get file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('material', fileInput.files[0])
      }

      const response = await apiClient.uploadMaterial(formData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Material uploaded successfully",
        })
        
        // Reset form
        setMaterialTitle('')
        setMaterialDescription('')
        setMaterialLink('')
        if (fileInput) fileInput.value = ''
        
        // Reload materials
        loadCourseMaterials(selectedCourse)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload material",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading material:', error)
      toast({
        title: "Error",
        description: "Failed to upload material",
        variant: "destructive",
      })
    } finally {
      setUploadingMaterial(false)
    }
  }

  const selectedCourseData = courses.find(course => course.id.toString() === selectedCourse)

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
              {courses.length} courses assigned
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="ml-2 text-muted-foreground">Loading courses...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any) => (
                <Card
                  key={course.id}
                  className={`glassmorphic cursor-pointer transition-all duration-200 ${
                    selectedCourse === course.id.toString() 
                      ? 'glow-cyan border-cyan-500/30' 
                      : 'hover:glow-purple border-white/10'
                  }`}
                  onClick={() => setSelectedCourse(course.id.toString())}
                >
                  <CardContent className="p-4">
                    <div className={`w-full h-2 bg-gradient-to-r ${course.color} rounded-full mb-3`} />
                    <h3 className="font-semibold text-foreground mb-1">{course.course_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{course.course_code}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {course.student_count} students
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {course.material_count} materials
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Material Management */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedCourseData && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {selectedCourseData.course_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCourseData.course_code} • {selectedCourseData.student_count} enrolled students
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

                        <Button 
                          type="submit" 
                          className="w-full glassmorphic hover:glow-green"
                          disabled={uploadingMaterial}
                        >
                          {uploadingMaterial ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Post Material
                            </>
                          )}
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
                        {materials.length} materials posted
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {materials.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No materials uploaded yet</p>
                            <p className="text-xs">Use the "Upload Material" tab to add content</p>
                          </div>
                        ) : (
                          materials.map((material: any) => (
                            <div key={material.id} className="flex items-center justify-between p-3 glassmorphic rounded-lg hover:bg-white/5 transition-colors">
                              <div className="flex items-center space-x-3 flex-1">
                                <FileText className={`w-5 h-5 ${
                                  material.type === 'pdf' ? 'text-red-400' : 
                                  material.type === 'ppt' ? 'text-orange-400' : 
                                  material.type === 'doc' ? 'text-blue-400' : 
                                  'text-gray-400'
                                }`} />
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{material.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Posted {new Date(material.uploaded_at).toLocaleDateString()} • {material.type.toUpperCase()}
                                    {material.file_size && ` • ${(parseInt(material.file_size) / 1024 / 1024).toFixed(1)} MB`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{material.type.toUpperCase()}</Badge>
                                {material.file_path && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="glassmorphic hover:glow-cyan"
                                    onClick={() => {
                                      // Handle both Windows and Unix paths - extract filename from full path
                                      let relativePath = material.file_path;
                                      
                                      // Handle Windows paths (backslashes)
                                      if (relativePath.includes('uploads\\materials\\')) {
                                        const filename = relativePath.split('uploads\\materials\\')[1];
                                        relativePath = `/uploads/materials/${filename}`;
                                      }
                                      // Handle Unix paths (forward slashes)
                                      else if (relativePath.includes('uploads/materials/')) {
                                        const filename = relativePath.split('uploads/materials/')[1];
                                        relativePath = `/uploads/materials/${filename}`;
                                      }
                                      // If it's already a relative path starting with /uploads/, use as is
                                      else if (relativePath.startsWith('/uploads/')) {
                                        // Already correct format
                                      }
                                      else {
                                        // Fallback: assume it's just a filename
                                        relativePath = `/uploads/materials/${relativePath}`;
                                      }
                                      
                                      console.log('Original path:', material.file_path);
                                      console.log('Converted to:', relativePath);
                                      window.open(`http://localhost:5000${relativePath}`, '_blank');
                                    }}
                                  >
                                    Download
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="students">
                  <Card className="glassmorphic">
                    <CardHeader>
                      <CardTitle>Enrolled Students</CardTitle>
                      <CardDescription>
                        {students.length} students in this course
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {students.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No students enrolled yet</p>
                            <p className="text-xs">Students will appear here once they enroll</p>
                          </div>
                        ) : (
                          students.map((student: any) => (
                            <div key={student.id} className="flex items-center space-x-3 p-3 glassmorphic rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                                  {student.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                {student.enrolled_at && (
                                  <p className="text-xs text-muted-foreground">
                                    Enrolled: {new Date(student.enrolled_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
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

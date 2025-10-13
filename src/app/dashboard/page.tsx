"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { CourseList } from "@/components/course-list"
import { MaterialList } from "@/components/material-list"
import { AssignmentList } from "@/components/assignment-list-simple"
import { ChatbotPanel } from "@/components/chatbot-panel"
import { CalendarPanel } from "@/components/calendar-panel"
import { ClassChatPanel } from "@/components/class-chat-panel"
import { 
  mockChatMessages, 
  mockCalendarEvents 
} from "@/lib/mock-data"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { apiClient } from "@/lib/api"
import { 
  LogOut, 
  Settings, 
  User as UserIcon, 
  GraduationCap,
  MessageCircle,
  Calendar,
  Bot
} from "lucide-react"

/**
 * Dashboard layout with 3-column responsive design
 * Left: Course list, Middle: Materials, Right: Tabbed panels (Chat, Calendar, Chatbot)
 * Mobile: Converts to tabbed interface
 */
export default function DashboardPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [mobileTab, setMobileTab] = useState('courses')
  const [courses, setCourses] = useState([])
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    // Load student data
    loadStudentData()

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [router, isAuthenticated, user])

  const loadStudentData = async () => {
    if (!user || user.role !== 'student') return
    
    try {
      setLoading(true)
      
      // Load student courses
      const coursesResponse = await apiClient.getStudentCourses()
      if (coursesResponse.success && coursesResponse.data) {
        const coursesData = (coursesResponse.data as any)?.courses || []
        setCourses(coursesData)
        setSelectedCourse(coursesData[0]?.id?.toString() || '')
      }
      
      // Load materials for all courses
      const materialsResponse = await apiClient.getStudentMaterials()
      if (materialsResponse.success && materialsResponse.data) {
        const materialsData = (materialsResponse.data as any)?.materials || []
        setMaterials(materialsData)
      }

      // Load assignments for all courses
      const assignmentsResponse = await apiClient.getStudentAssignments()
      if (assignmentsResponse.success && assignmentsResponse.data) {
        const assignmentsData = (assignmentsResponse.data as any)?.assignments || []
        setAssignments(assignmentsData)
      }
      
    } catch (error) {
      console.error('Failed to load student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId)
    if (isMobile) {
      setMobileTab('materials')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
        {/* Mobile Header */}
        <header className="glassmorphic border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-6 h-6 text-cyan-400" />
              <h1 className="text-lg font-semibold text-foreground">ELMS</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glassmorphic" align="end">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{user.name}</span>
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

        {/* Mobile Tabs */}
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="h-[calc(100vh-80px)]">
          <TabsList className="grid w-full grid-cols-4 glassmorphic m-2">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="h-full mt-0">
            <CourseList 
              courses={courses} 
              selectedCourseId={selectedCourse}
              onCourseSelect={handleCourseSelect}
            />
          </TabsContent>
          
          <TabsContent value="materials" className="h-full mt-0">
            <MaterialList materials={materials} courseId={selectedCourse} />
          </TabsContent>

          <TabsContent value="assignments" className="h-full mt-0">
            <AssignmentList 
              assignments={assignments} 
              courseId={selectedCourse} 
              onSubmissionSuccess={() => loadStudentData()}
            />
          </TabsContent>
          
          <TabsContent value="chat" className="h-full mt-0">
            <div className="p-4 h-full">
              <ClassChatPanel messages={mockChatMessages} currentUser={user.name} />
            </div>
          </TabsContent>
          
          <TabsContent value="more" className="h-full mt-0">
            <Tabs defaultValue="calendar" orientation="vertical" className="h-full">
              <TabsList className="grid w-full grid-cols-2 glassmorphic m-2">
                <TabsTrigger value="calendar">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="chatbot">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="h-[calc(100%-60px)] mt-0">
                <div className="p-4 h-full">
                  <CalendarPanel events={mockCalendarEvents} />
                </div>
              </TabsContent>
              
              <TabsContent value="chatbot" className="h-[calc(100%-60px)] mt-0">
                <div className="p-4 h-full">
                  <ChatbotPanel />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
      </ProtectedRoute>
    )
  }

  // Desktop Layout
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col overflow-hidden">
      {/* Desktop Header */}
      <header className="glassmorphic border-b border-white/10 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-foreground">ELMS Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glassmorphic" align="end">
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
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

      {/* Desktop 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Course List (3/12 = 25%) */}
        <div className="w-1/4 border-r border-white/10 glassmorphic flex flex-col overflow-hidden">
          <CourseList 
            courses={courses} 
            selectedCourseId={selectedCourse}
            onCourseSelect={handleCourseSelect}
          />
        </div>

        {/* Middle Column - Materials & Assignments Tabs (5/12 = ~42%) */}
        <div className="flex-1 border-r border-white/10 flex flex-col overflow-hidden">
          <Tabs defaultValue="materials" className="flex flex-col h-full">
            <TabsList className="grid grid-cols-2 w-full p-1 glassmorphic flex-shrink-0 rounded-none border-b border-white/10">
              <TabsTrigger 
                value="materials"
                className="glassmorphic hover:glow-blue data-[state=active]:glow-blue transition-all duration-200"
              >
                📄 Materials
              </TabsTrigger>
              <TabsTrigger 
                value="assignments"
                className="glassmorphic hover:glow-green data-[state=active]:glow-green transition-all duration-200"
              >
                📝 Assignments
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="materials" className="h-full m-0">
                <MaterialList materials={materials} courseId={selectedCourse} />
              </TabsContent>
              
              <TabsContent value="assignments" className="h-full m-0">
                <AssignmentList 
                  assignments={assignments} 
                  courseId={selectedCourse} 
                  onSubmissionSuccess={() => loadStudentData()}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Column - Horizontal Navbar Tabs (4/12 = 33%) */}
        <div className="w-1/3 glassmorphic flex flex-col overflow-hidden">
          <Tabs defaultValue="chatbot" className="flex flex-col h-full">
            {/* Horizontal Navbar */}
            <TabsList className="grid grid-cols-3 w-full p-1 glassmorphic flex-shrink-0 rounded-none border-b border-white/10">
              <TabsTrigger 
                value="chatbot" 
                className="glassmorphic hover:glow-cyan data-[state=active]:glow-cyan transition-all duration-200"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="glassmorphic hover:glow-purple data-[state=active]:glow-purple transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="glassmorphic hover:glow-green data-[state=active]:glow-green transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Class Chat
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="chatbot" className="h-full m-0">
                <ChatbotPanel />
              </TabsContent>
              
              <TabsContent value="calendar" className="h-full m-0">
                <CalendarPanel events={mockCalendarEvents} />
              </TabsContent>
              
              <TabsContent value="chat" className="h-full m-0">
                <ClassChatPanel messages={mockChatMessages} currentUser={user.name} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}

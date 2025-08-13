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
import { ChatbotPanel } from "@/components/chatbot-panel"
import { CalendarPanel } from "@/components/calendar-panel"
import { ClassChatPanel } from "@/components/class-chat-panel"
import { 
  mockCourses, 
  mockMaterials, 
  mockChatMessages, 
  mockCalendarEvents 
} from "@/lib/mock-data"
import { User } from "@/types"
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
  const [user, setUser] = useState<User | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [mobileTab, setMobileTab] = useState('courses')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const authData = localStorage.getItem('auth')
    if (!authData) {
      router.push('/')
      return
    }

    const auth = JSON.parse(authData)
    if (!auth.isAuthenticated) {
      router.push('/')
      return
    }

    setUser(auth.user)
    setSelectedCourse(mockCourses[0]?.id || '')

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth')
    router.push('/')
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
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="h-full mt-0">
            <CourseList 
              courses={mockCourses} 
              selectedCourseId={selectedCourse}
              onCourseSelect={handleCourseSelect}
            />
          </TabsContent>
          
          <TabsContent value="materials" className="h-full mt-0">
            <MaterialList materials={mockMaterials} courseId={selectedCourse} />
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
    )
  }

  // Desktop Layout
  return (
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
        {/* Left Column - Course List */}
        <div className="w-80 border-r border-white/10 glassmorphic flex flex-col overflow-hidden">
          <CourseList 
            courses={mockCourses} 
            selectedCourseId={selectedCourse}
            onCourseSelect={handleCourseSelect}
          />
        </div>

        {/* Middle Column - Materials */}
        <div className="flex-1 border-r border-white/10 flex flex-col overflow-hidden">
          <MaterialList materials={mockMaterials} courseId={selectedCourse} />
        </div>

        {/* Right Column - Vertical Tabs */}
        <div className="w-80 glassmorphic flex flex-col overflow-hidden">
          <Tabs defaultValue="chatbot" orientation="vertical" className="flex flex-col h-full">
            <TabsList className="flex flex-col h-auto w-full p-2 space-y-2 glassmorphic flex-shrink-0">
              <TabsTrigger 
                value="chatbot" 
                className="w-full justify-start glassmorphic hover:glow-cyan data-[state=active]:glow-cyan"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="w-full justify-start glassmorphic hover:glow-purple data-[state=active]:glow-purple"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="w-full justify-start glassmorphic hover:glow-green data-[state=active]:glow-green"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Class Chat
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="chatbot" className="h-full m-0 p-4">
                <ChatbotPanel />
              </TabsContent>
              
              <TabsContent value="calendar" className="h-full m-0 p-4">
                <CalendarPanel events={mockCalendarEvents} />
              </TabsContent>
              
              <TabsContent value="chat" className="h-full m-0 p-4">
                <ClassChatPanel messages={mockChatMessages} currentUser={user.name} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, BookOpen, FileText } from "lucide-react"

interface StudentCourse {
  id: number
  course_name: string
  course_code: string
  description: string
  credits: number
  semester: string
  academic_year: string
  color?: string
  teacher_name?: string
  teacher_email?: string
  material_count: number
  assignment_count: number
  submission_count: number
}

interface CourseListProps {
  courses: StudentCourse[]
  selectedCourseId?: string
  onCourseSelect: (courseId: string) => void
}

/**
 * CourseList component displays a list of courses for the logged-in user
 * Features glassmorphic design with neon-punk hover effects
 */
export function CourseList({ courses, selectedCourseId, onCourseSelect }: CourseListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h2 className="text-xl font-semibold text-foreground mb-2">My Courses</h2>
        <Badge variant="secondary" className="glassmorphic">
          <BookOpen className="w-3 h-3 mr-1" />
          {courses.length} Enrolled
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`glassmorphic hover:glow-purple cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                selectedCourseId === course.id.toString() ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => onCourseSelect(course.id.toString())}
            >
              <CardHeader className="p-4">
                <div className={`w-full h-3 rounded-full mb-3 ${
                  course.color || 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`} />
                <CardTitle className="text-sm font-medium text-foreground leading-tight">
                  {course.course_code}: {course.course_name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {course.teacher_name || 'No Teacher Assigned'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {course.credits} Credits
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {course.material_count} Materials
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course.assignment_count} Assignments
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

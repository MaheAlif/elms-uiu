"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Plus, Users, Trash2, Edit, UserCheck, ChevronDown } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Section {
  id: number
  course_id: number
  course_code: string
  course_title: string
  name: string
  teacher_id?: number
  teacher_name?: string
  max_capacity: number
  current_enrollment: number
  created_at: string
}

interface Course {
  id: number
  course_code: string
  course_name: string
  title: string
}

interface Teacher {
  id: number
  name: string
  email: string
}

export function SectionManagement() {
  const [sections, setSections] = useState<Section[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all")
  
  const { toast } = useToast()

  // Form state for creating section
  const [formData, setFormData] = useState({
    course_id: "",
    name: "",
    teacher_id: "",
    max_capacity: "50"
  })

  useEffect(() => {
    loadData()
  }, [selectedCourseFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load sections
      const courseId = selectedCourseFilter !== "all" ? selectedCourseFilter : undefined
      const sectionsRes = await apiClient.getAdminSections(courseId)
      if (sectionsRes.success) {
        setSections((sectionsRes.data as any) || [])
      }

      // Load courses
      const coursesRes = await apiClient.getAdminCourses({ page: 1, limit: 100 })
      if (coursesRes.success) {
        const coursesData = (coursesRes.data as any)?.courses || []
        setCourses(coursesData)
      }

      // Load teachers
      const teachersRes = await apiClient.getAllUsers({ role: "teacher" })
      if (teachersRes.success) {
        const teachersData = (teachersRes.data as any)?.users || []
        setTeachers(teachersData)
      }
    } catch (error) {
      console.error("Load error:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSection = async () => {
    if (!formData.course_id || !formData.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await apiClient.createAdminSection({
        course_id: parseInt(formData.course_id),
        name: formData.name,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : undefined,
        max_capacity: parseInt(formData.max_capacity)
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Section created successfully",
          className: "bg-green-500/10 border-green-500/50 text-green-400"
        })
        setIsCreateDialogOpen(false)
        setFormData({ course_id: "", name: "", teacher_id: "", max_capacity: "50" })
        loadData()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create section",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      const response = await apiClient.deleteSection(sectionId.toString())
      if (response.success) {
        toast({
          title: "Success",
          description: "Section deleted successfully",
          className: "bg-green-500/10 border-green-500/50 text-green-400"
        })
        loadData()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete section",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      })
    }
  }

  const handleAssignTeacher = async (sectionId: number) => {
    const teacherId = prompt("Enter teacher ID to assign:")
    if (!teacherId) return

    try {
      const response = await apiClient.assignTeacherToSection(sectionId.toString(), parseInt(teacherId))
      if (response.success) {
        toast({
          title: "Success",
          description: "Teacher assigned successfully",
          className: "bg-green-500/10 border-green-500/50 text-green-400"
        })
        loadData()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to assign teacher",
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  // Group sections by course
  const sectionsByCourse = sections.reduce((acc, section) => {
    const courseKey = `${section.course_code} - ${section.course_title}`
    if (!acc[courseKey]) {
      acc[courseKey] = []
    }
    acc[courseKey].push(section)
    return acc
  }, {} as Record<string, Section[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Section Management</h2>
          <p className="text-muted-foreground">Create and manage course sections</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent className="glassmorphic">
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Create a new section for a course. Students will be enrolled in specific sections.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between glassmorphic">
                      {formData.course_id 
                        ? `${courses.find(c => c.id.toString() === formData.course_id)?.course_code} - ${courses.find(c => c.id.toString() === formData.course_id)?.course_name || courses.find(c => c.id.toString() === formData.course_id)?.title}`
                        : "Select a course"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glassmorphic w-full max-h-60 overflow-y-auto">
                    {courses.map((course) => (
                      <DropdownMenuItem
                        key={course.id}
                        onClick={() => setFormData({...formData, course_id: course.id.toString()})}
                      >
                        {course.course_code} - {course.course_name || course.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Section Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Section A, Morning Batch"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Assign Teacher (Optional)</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between glassmorphic">
                      {formData.teacher_id 
                        ? `${teachers.find(t => t.id.toString() === formData.teacher_id)?.name} (${teachers.find(t => t.id.toString() === formData.teacher_id)?.email})`
                        : "No Teacher"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glassmorphic w-full max-h-60 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setFormData({...formData, teacher_id: ""})}>
                      No Teacher
                    </DropdownMenuItem>
                    {teachers.map((teacher) => (
                      <DropdownMenuItem
                        key={teacher.id}
                        onClick={() => setFormData({...formData, teacher_id: teacher.id.toString()})}
                      >
                        {teacher.name} ({teacher.email})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({...formData, max_capacity: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>Create Section</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Course:</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-between glassmorphic">
              {selectedCourseFilter === "all" 
                ? "All Courses" 
                : `${courses.find(c => c.id.toString() === selectedCourseFilter)?.course_code} - ${courses.find(c => c.id.toString() === selectedCourseFilter)?.course_name || courses.find(c => c.id.toString() === selectedCourseFilter)?.title}`}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glassmorphic w-[300px] max-h-60 overflow-y-auto">
            <DropdownMenuItem onClick={() => setSelectedCourseFilter("all")}>
              All Courses
            </DropdownMenuItem>
            {courses.map((course) => (
              <DropdownMenuItem
                key={course.id}
                onClick={() => setSelectedCourseFilter(course.id.toString())}
              >
                {course.course_code} - {course.course_name || course.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sections Display */}
      {Object.keys(sectionsByCourse).length === 0 ? (
        <Card className="glassmorphic">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No sections found. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(sectionsByCourse).map(([courseName, courseSections]) => (
            <div key={courseName}>
              <h3 className="text-lg font-semibold mb-3">{courseName}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courseSections.map((section) => (
                  <Card key={section.id} className="glassmorphic">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        {section.name}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignTeacher(section.id)}
                            className="h-8 w-8 p-0"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSection(section.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {section.teacher_name ? `Teacher: ${section.teacher_name}` : "No teacher assigned"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Enrolled:</span>
                          <span className="font-semibold">
                            {section.current_enrollment} / {section.max_capacity}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: `${(section.current_enrollment / section.max_capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

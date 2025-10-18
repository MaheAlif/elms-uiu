"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, ChevronDown, Layers } from "lucide-react"
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

interface SimpleSectionManagementProps {
  onSectionChange?: () => void; // Callback to refresh parent data
}

export function SimpleSectionManagement({ onSectionChange }: SimpleSectionManagementProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const { toast } = useToast()

  // Form state for creating section
  const [formData, setFormData] = useState({
    course_id: "",
    name: "",
    max_capacity: "50"
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('SimpleSectionManagement: Loading data...')
      
      // Load sections
      const sectionsRes = await apiClient.getAdminSections()
      console.log('Sections response:', sectionsRes)
      if (sectionsRes.success) {
        const sectionsData = (sectionsRes.data as any) || []
        console.log('Sections data:', sectionsData)
        setSections(sectionsData)
      } else {
        setError('Failed to load sections')
      }

      // Load courses
      const coursesRes = await apiClient.getAdminCourses({ page: 1, limit: 100 })
      console.log('Courses response:', coursesRes)
      if (coursesRes.success) {
        const coursesData = (coursesRes.data as any)?.courses || []
        console.log('Courses data:', coursesData)
        setCourses(coursesData)
      } else {
        setError('Failed to load courses')
      }
    } catch (error) {
      console.error("Load error:", error)
      setError('Network error - check console')
      toast({
        title: "Error",
        description: "Failed to load data. Check browser console for details.",
        variant: "destructive"
      })
    } finally {
      console.log('SimpleSectionManagement: Loading complete')
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
        max_capacity: parseInt(formData.max_capacity)
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Section created successfully",
          className: "bg-green-500/10 border-green-500/50 text-green-400"
        })
        setIsCreateDialogOpen(false)
        setFormData({ course_id: "", name: "", max_capacity: "50" })
        loadData()
        // Notify parent to refresh its data too
        if (onSectionChange) {
          onSectionChange()
        }
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
    if (!confirm("Are you sure you want to delete this section? All enrollments will be removed.")) return

    try {
      const response = await apiClient.deleteSection(sectionId.toString())
      if (response.success) {
        toast({
          title: "Success",
          description: "Section deleted successfully",
          className: "bg-green-500/10 border-green-500/50 text-green-400"
        })
        loadData()
        // Notify parent to refresh its data too
        if (onSectionChange) {
          onSectionChange()
        }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        <p className="text-muted-foreground">Loading sections...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="text-red-400">Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData} className="glassmorphic">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Section Card */}
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2 text-cyan-400" />
            Create New Section
          </CardTitle>
          <CardDescription>
            Create sections for courses. Teachers will be assigned later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full glassmorphic hover:glow-cyan">
                <Plus className="w-4 h-4 mr-2" />
                Create Section
              </Button>
            </DialogTrigger>
            <DialogContent className="glassmorphic">
              <DialogHeader>
                <DialogTitle>Create New Section</DialogTitle>
                <DialogDescription>
                  Create a new section for a course. You can assign teachers later in the Teachers tab.
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
                    placeholder="e.g., Section A, Morning Batch, Group 1"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
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
        </CardContent>
      </Card>

      {/* Sections List */}
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="w-5 h-5 mr-2 text-purple-400" />
            All Sections
          </CardTitle>
          <CardDescription>
            {sections.length} sections in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sections created yet. Create one above to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="glassmorphic p-4 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {section.course_code} - {section.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {section.course_title}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Teacher: {section.teacher_name || "Not assigned"}</span>
                        <span>Enrolled: {section.current_enrollment}/{section.max_capacity}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus } from "lucide-react"
import { apiClient } from "@/lib/api"
import { SimpleSectionManagement } from "@/components/admin/simple-section-management"

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  // Course form state
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
    credits: "3",
    semester: "Fall",
    academicYear: "2025-2026",
  })

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const load = async () => {
    const [statsRes, coursesRes, teachersRes, studentsRes] = await Promise.all([
      apiClient.getAdminStats(),
      apiClient.getAdminCourses({ page: 1, limit: 100 }),
      apiClient.getTeachers(),
      apiClient.getAllUsers({ role: 'student', page: 1, limit: 100 })
    ])
    if (statsRes.success) setStats(statsRes.data)
    if (coursesRes.success) setCourses(((coursesRes.data as any)?.courses) || [])
    if (teachersRes.success) setTeachers((teachersRes.data as any) || [])
    if (studentsRes.success) setStudents(((studentsRes.data as any)?.users) || [])
  }

  useEffect(() => { load() }, [])

  const createCourse = async () => {
    await apiClient.createAdminCourse({
      course_name: courseForm.name,
      course_code: courseForm.code,
      description: courseForm.description,
      credits: parseInt(courseForm.credits || '0'),
      semester: courseForm.semester,
      academic_year: courseForm.academicYear,
    })
    setCourseForm({ name: "", code: "", description: "", credits: "3", semester: "Fall", academicYear: "2025-2026" })
    await load()
  }

  const createTeacher = async () => {
    await apiClient.createTeacher({
      name: teacherForm.name,
      email: teacherForm.email,
      password: teacherForm.password,
    })
    setTeacherForm({ name: "", email: "", password: "" })
    await load()
  }

  const createStudent = async () => {
    await apiClient.createStudent({
      name: studentForm.name,
      email: studentForm.email,
      password: studentForm.password,
    })
    setStudentForm({ name: "", email: "", password: "" })
    await load()
  }

  return (
    <div className="flex-1 overflow-auto">
      <Card className="glassmorphic mb-4">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage courses, teachers, students, and sections</CardDescription>
        </CardHeader>
        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
              <div className="glassmorphic p-3 rounded">Courses: <b>{stats.courses || '-'}</b></div>
              <div className="glassmorphic p-3 rounded">Teachers: <b>{stats.teachers || '-'}</b></div>
              <div className="glassmorphic p-3 rounded">Students: <b>{stats.students || '-'}</b></div>
              <div className="glassmorphic p-3 rounded">Sections: <b>{stats.sections || '-'}</b></div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="courses" className="h-full">
        <TabsList className="glassmorphic mb-4">
          <TabsTrigger value="courses" data-testid="courses-tab">Courses</TabsTrigger>
          <TabsTrigger value="teachers" data-testid="teachers-tab">Teachers</TabsTrigger>
          <TabsTrigger value="students" data-testid="students-tab">Students</TabsTrigger>
          <TabsTrigger value="sections" data-testid="sections-tab">Sections</TabsTrigger>
        </TabsList>

        {/* Courses */}
        <TabsContent value="courses">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Create Course</CardTitle>
                <CardDescription>Fill details and create a new course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Course Name" value={courseForm.name} onChange={e=>setCourseForm({...courseForm, name:e.target.value})} data-testid="course-name-input"/>
                <Input placeholder="Course Code" value={courseForm.code} onChange={e=>setCourseForm({...courseForm, code:e.target.value})} data-testid="course-code-input"/>
                <Input placeholder="Description" value={courseForm.description} onChange={e=>setCourseForm({...courseForm, description:e.target.value})} data-testid="course-description-input"/>
                <Input type="number" placeholder="Credits" value={courseForm.credits} onChange={e=>setCourseForm({...courseForm, credits:e.target.value})} data-testid="course-credits-input"/>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="justify-between w-full" data-testid="course-semester-dropdown">
                      {courseForm.semester}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glassmorphic">
                    {['Fall','Spring','Summer'].map(s => (
                      <DropdownMenuItem key={s} onClick={()=>setCourseForm({...courseForm, semester:s})} data-testid={`semester-${s.toLowerCase()}`}>
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input placeholder="Academic Year (e.g., 2025-2026)" value={courseForm.academicYear} onChange={e=>setCourseForm({...courseForm, academicYear:e.target.value})} data-testid="course-academic-year-input"/>
                <Button onClick={createCourse} className="w-full" data-testid="create-course-submit-btn">Create Course</Button>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Existing Courses</CardTitle>
                <CardDescription>{courses.length} total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2" data-testid="course-list">
                {courses.map((c:any)=> (
                  <div key={c.id} className="glassmorphic p-3 rounded border" data-testid={`course-item-${c.id}`}>
                    <div className="font-medium">{c.course_code}: {c.course_name || c.title}</div>
                    <div className="text-xs text-muted-foreground">Credits: {c.credits} • {c.semester} • {c.academic_year}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teachers */}
        <TabsContent value="teachers">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Create Teacher</CardTitle>
                <CardDescription>Add a new teacher to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Name" value={teacherForm.name} onChange={e=>setTeacherForm({...teacherForm, name:e.target.value})} data-testid="teacher-name-input"/>
                <Input placeholder="Email" type="email" value={teacherForm.email} onChange={e=>setTeacherForm({...teacherForm, email:e.target.value})} data-testid="teacher-email-input"/>
                <Input placeholder="Password" type="password" value={teacherForm.password} onChange={e=>setTeacherForm({...teacherForm, password:e.target.value})} data-testid="teacher-password-input"/>
                <Button onClick={createTeacher} className="w-full" data-testid="create-teacher-submit-btn">Create</Button>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>{teachers.length} total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2" data-testid="teachers-list">
                {teachers.map((t:any)=> (
                  <div key={t.id} className="glassmorphic p-3 rounded border" data-testid={`teacher-item-${t.id}`}>{t.name} • {t.email}</div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students */}
        <TabsContent value="students">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Create Student</CardTitle>
                <CardDescription>Add a new student to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Name" value={studentForm.name} onChange={e=>setStudentForm({...studentForm, name:e.target.value})} data-testid="student-name-input"/>
                <Input placeholder="Email" type="email" value={studentForm.email} onChange={e=>setStudentForm({...studentForm, email:e.target.value})} data-testid="student-email-input"/>
                <Input placeholder="Password" type="password" value={studentForm.password} onChange={e=>setStudentForm({...studentForm, password:e.target.value})} data-testid="student-password-input"/>
                <Button onClick={createStudent} className="w-full" data-testid="create-student-submit-btn">Create Student</Button>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>{students.length} total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2" data-testid="students-list">
                {students.map((s:any)=> (
                  <div key={s.id} className="glassmorphic p-3 rounded border" data-testid={`student-item-${s.id}`}>{s.name} • {s.email}</div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sections */}
        <TabsContent value="sections">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="flex items-center"><Plus className="w-4 h-4 mr-2"/>Manage Sections</CardTitle>
              <CardDescription>Create and view sections for courses</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simple management re-used; add test-ids inside that component */}
              <SimpleSectionManagement onSectionChange={load} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard

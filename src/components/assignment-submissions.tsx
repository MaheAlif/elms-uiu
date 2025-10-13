"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  FileText, 
  Loader2,
  Star,
  Eye,
  GraduationCap
} from "lucide-react"

interface AssignmentSubmissionsProps {
  assignmentId: string
  onClose?: () => void
}

interface Student {
  student_id: number
  student_name: string
  student_email: string
  submission_id?: number
  file_path?: string
  submitted_at?: string
  grade?: number
  feedback?: string
  graded_at?: string
  status: 'submitted' | 'overdue' | 'pending'
  days_late: number
}

interface Assignment {
  id: number
  title: string
  description: string
  due_date: string
  total_marks: number
  course_name: string
  course_code: string
  section_name: string
  statistics: {
    total_students: number
    submitted_count: number
    graded_count: number
    overdue_count: number
    pending_count: number
  }
}

export function AssignmentSubmissions({ assignmentId, onClose }: AssignmentSubmissionsProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingStudent, setGradingStudent] = useState<Student | null>(null)
  const [gradeValue, setGradeValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submittingGrade, setSubmittingGrade] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'pending' | 'overdue'>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadSubmissions()
  }, [assignmentId])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAssignmentSubmissions(assignmentId)
      
      if (response.success && response.data) {
        const data = response.data as { assignment: Assignment; students: Student[] }
        setAssignment(data.assignment)
        setStudents(data.students || [])
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load submissions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (submissionId: number) => {
    try {
      await apiClient.downloadSubmission(submissionId.toString())
      toast({
        title: "Success",
        description: "File downloaded successfully",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      })
    }
  }

  const handleGradeSubmission = async () => {
    if (!gradingStudent || !gradeValue) {
      toast({
        title: "Error",
        description: "Please enter a grade",
        variant: "destructive",
      })
      return
    }

    const grade = parseFloat(gradeValue)
    if (isNaN(grade) || grade < 0 || (assignment && grade > assignment.total_marks)) {
      toast({
        title: "Error",
        description: `Grade must be between 0 and ${assignment?.total_marks || 100}`,
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingGrade(true)
      
      const response = await apiClient.gradeSubmission(gradingStudent.submission_id!.toString(), {
        grade,
        feedback: feedback.trim() || undefined
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Submission graded successfully",
        })
        
        // Reset form and close dialog
        setGradingStudent(null)
        setGradeValue('')
        setFeedback('')
        
        // Reload submissions to show updated grade
        await loadSubmissions()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to grade submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Grading error:', error)
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive",
      })
    } finally {
      setSubmittingGrade(false)
    }
  }

  const openGradingDialog = (student: Student) => {
    setGradingStudent(student)
    setGradeValue(student.grade?.toString() || '')
    setFeedback(student.feedback || '')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'text-green-400 bg-green-500/20'
      case 'overdue':
        return 'text-red-400 bg-red-500/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const filteredStudents = students.filter(student => {
    if (filterStatus === 'all') return true
    return student.status === filterStatus
  })

  if (loading) {
    return (
      <Card className="glassmorphic">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-3 text-muted-foreground">Loading submissions...</span>
        </CardContent>
      </Card>
    )
  }

  if (!assignment) {
    return (
      <Card className="glassmorphic">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-muted-foreground">Assignment not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Assignment Header */}
      <Card className="glassmorphic">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center text-xl">
                <GraduationCap className="w-6 h-6 mr-2 text-cyan-400" />
                {assignment.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {assignment.course_code} • {assignment.section_name} • Due: {new Date(assignment.due_date).toLocaleString()}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {assignment.description}
              </p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose} className="glassmorphic">
                Back to Assignments
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{assignment.statistics.total_students}</div>
              <div className="text-xs text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{assignment.statistics.submitted_count}</div>
              <div className="text-xs text-muted-foreground">Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{assignment.statistics.graded_count}</div>
              <div className="text-xs text-muted-foreground">Graded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{assignment.statistics.overdue_count}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{assignment.statistics.pending_count}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Card className="glassmorphic">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Students', count: assignment.statistics.total_students },
              { key: 'submitted', label: 'Submitted', count: assignment.statistics.submitted_count },
              { key: 'pending', label: 'Pending', count: assignment.statistics.pending_count },
              { key: 'overdue', label: 'Overdue', count: assignment.statistics.overdue_count }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filterStatus === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(key as any)}
                className={`glassmorphic ${filterStatus === key ? 'glow-cyan' : ''}`}
              >
                {label} ({count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>
            {filteredStudents.length} students {filterStatus !== 'all' ? `with ${filterStatus} status` : 'total'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No students found with {filterStatus} status</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.student_id}
                  className="flex items-center justify-between p-4 glassmorphic rounded-lg border hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                        {student.student_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground">{student.student_name}</h4>
                        <Badge className={`text-xs ${getStatusColor(student.status)}`}>
                          {getStatusIcon(student.status)}
                          <span className="ml-1 capitalize">{student.status}</span>
                        </Badge>
                        {student.days_late > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {student.days_late} days late
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{student.student_email}</p>
                      {student.submitted_at && (
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(student.submitted_at).toLocaleString()}
                        </p>
                      )}
                      {student.grade !== null && student.grade !== undefined && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {student.grade}/{assignment.total_marks}
                          </Badge>
                          {student.graded_at && (
                            <span className="text-xs text-muted-foreground">
                              Graded: {new Date(student.graded_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {student.submission_id && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(student.submission_id!)}
                          className="glassmorphic hover:glow-cyan"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGradingDialog(student)}
                              className="glassmorphic hover:glow-orange"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {student.grade !== null && student.grade !== undefined ? 'Update Grade' : 'Grade'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glassmorphic">
                            <DialogHeader>
                              <DialogTitle>Grade Submission</DialogTitle>
                              <DialogDescription>
                                Grade {student.student_name}'s submission for "{assignment.title}"
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  Grade (out of {assignment.total_marks})
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={assignment.total_marks}
                                  value={gradeValue}
                                  onChange={(e) => setGradeValue(e.target.value)}
                                  className="glassmorphic mt-1"
                                  placeholder="Enter grade..."
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  Feedback (Optional)
                                </label>
                                <Textarea
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  className="glassmorphic mt-1"
                                  placeholder="Provide feedback to the student..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button
                                onClick={handleGradeSubmission}
                                disabled={submittingGrade}
                                className="glassmorphic hover:glow-green"
                              >
                                {submittingGrade ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving Grade...
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Save Grade
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Dialog */}
      {gradingStudent && (
        <Dialog open={!!gradingStudent} onOpenChange={() => setGradingStudent(null)}>
          <DialogContent className="glassmorphic">
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>
                Grade {gradingStudent.student_name}'s submission for "{assignment.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Grade (out of {assignment.total_marks})
                </label>
                <Input
                  type="number"
                  min="0"
                  max={assignment.total_marks}
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="glassmorphic mt-1"
                  placeholder="Enter grade..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">
                  Feedback (Optional)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="glassmorphic mt-1"
                  placeholder="Provide feedback to the student..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setGradingStudent(null)}
                className="glassmorphic"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGradeSubmission}
                disabled={submittingGrade}
                className="glassmorphic hover:glow-green"
              >
                {submittingGrade ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Grade...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Save Grade
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
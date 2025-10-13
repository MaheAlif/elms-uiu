"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { 
  FileText, 
  Upload, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  GraduationCap,
  X
} from "lucide-react"
import { apiClient } from "@/lib/api"

interface StudentAssignment {
  id: number
  title: string
  description: string
  due_date: string
  total_marks: number
  created_at: string
  course_name: string
  course_code: string
  course_id: number
  submission_title?: string
  submission_file?: string
  submitted_at?: string
  grade?: number
  feedback?: string
  graded_at?: string
  status: 'pending' | 'submitted' | 'overdue'
  days_remaining: number
}

interface AssignmentListProps {
  assignments: StudentAssignment[]
  courseId?: string
  onSubmissionSuccess?: () => void
}

/**
 * AssignmentList component displays assignments with submission functionality
 * Shows different status badges and allows file upload submissions
 */
export function AssignmentList({ assignments, courseId, onSubmissionSuccess }: AssignmentListProps) {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionTitle, setSubmissionTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false)

  const filteredAssignments = courseId 
    ? assignments.filter(assignment => assignment.course_id.toString() === courseId)
    : assignments

  const getStatusBadge = (assignment: StudentAssignment) => {
    if (assignment.status === 'submitted') {
      return (
        <Badge className="glassmorphic bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      )
    } else if (assignment.status === 'overdue') {
      return (
        <Badge className="glassmorphic bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      )
    } else {
      return (
        <Badge className="glassmorphic bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionFile || !submissionTitle.trim()) {
      alert('Please provide both a title and file for your submission')
      return
    }

    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('title', submissionTitle)
      formData.append('submission', submissionFile)

      const response = await apiClient.submitAssignment(selectedAssignment.id.toString(), formData)

      if (response.success) {
        alert('Assignment submitted successfully!')
        setSubmissionDialogOpen(false)
        setSubmissionFile(null)
        setSubmissionTitle('')
        setSelectedAssignment(null)
        onSubmissionSuccess?.()
      } else {
        alert(`Submission failed: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (filteredAssignments.length === 0) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Assignments Found</h3>
          <p className="text-muted-foreground">
            {courseId ? 'This course has no assignments yet' : 'No assignments available'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h2 className="text-xl font-semibold text-foreground mb-2">Assignments</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="glassmorphic">
            {filteredAssignments.length} Total
          </Badge>
          <Badge className="glassmorphic bg-green-500/20 text-green-400">
            {filteredAssignments.filter(a => a.status === 'submitted').length} Submitted
          </Badge>
          <Badge className="glassmorphic bg-yellow-500/20 text-yellow-400">
            {filteredAssignments.filter(a => a.status === 'pending').length} Pending
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="glassmorphic hover:glow-cyan transition-all duration-300">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-foreground leading-tight">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      <div className="flex items-center space-x-4 mb-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {assignment.days_remaining >= 0 ? `${assignment.days_remaining} days left` : 'Overdue'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span>{assignment.course_code}: {assignment.course_name}</span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(assignment)}
                </div>
                
                {assignment.description && (
                  <div className="mt-2 text-xs text-muted-foreground bg-black/20 rounded p-2">
                    {assignment.description}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Total Marks:</span> {assignment.total_marks}
                    {assignment.grade !== null && assignment.grade !== undefined && (
                      <span className="ml-4">
                        <span className="font-medium">Grade:</span> {assignment.grade}/{assignment.total_marks}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {assignment.status === 'submitted' && assignment.submission_file && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="glassmorphic hover:glow-blue"
                        onClick={() => {
                          // Download submitted file
                          const downloadUrl = `http://localhost:5000/uploads/${assignment.submission_file}`
                          window.open(downloadUrl, '_blank')
                        }}
                      >
                        <FileText className="w-3 h-3 mr-2" />
                        View Submission
                      </Button>
                    )}
                    
                    {assignment.status !== 'submitted' && (
                      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="glassmorphic hover:glow-green"
                            onClick={() => setSelectedAssignment(assignment)}
                          >
                            <Upload className="w-3 h-3 mr-2" />
                            Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glassmorphic">
                          <DialogHeader>
                            <DialogTitle>Submit Assignment</DialogTitle>
                            <DialogDescription>
                              Upload your assignment file for: {selectedAssignment?.title}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title">Submission Title</Label>
                              <Input
                                id="title"
                                value={submissionTitle}
                                onChange={(e) => setSubmissionTitle(e.target.value)}
                                placeholder="Enter a title for your submission"
                                className="glassmorphic"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="file">Assignment File</Label>
                              <Input
                                id="file"
                                type="file"
                                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                accept=".pdf,.doc,.docx,.txt,.zip"
                                className="glassmorphic"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Supported formats: PDF, DOC, DOCX, TXT, ZIP
                              </p>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSubmissionDialogOpen(false)
                                  setSubmissionFile(null)
                                  setSubmissionTitle('')
                                }}
                                disabled={isSubmitting}
                                className="glassmorphic"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !submissionFile || !submissionTitle.trim()}
                                className="glassmorphic hover:glow-green"
                              >
                                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                
                {assignment.feedback && (
                  <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                    <strong className="text-blue-400">Teacher Feedback:</strong>
                    <p className="text-muted-foreground mt-1">{assignment.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
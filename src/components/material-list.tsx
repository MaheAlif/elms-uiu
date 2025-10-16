"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, FileSpreadsheet, FileImage, Video, Download, Calendar, Clock, BookOpen, Bot } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface StudentMaterial {
  id: number
  title: string
  type: string
  file_path: string
  size: string
  upload_date: string
  course_name: string
  course_code: string
  course_id: number
  uploaded_by?: string
}

interface MaterialListProps {
  materials: StudentMaterial[]
  courseId?: string
}

/**
 * MaterialList component displays course materials with download functionality
 * Shows different icons based on file type and includes glassmorphic styling
 * Includes "Add to AI Chat" button for AI assistant integration
 */
export function MaterialList({ materials, courseId }: MaterialListProps) {
  const { toast } = useToast()
  
  const filteredMaterials = courseId 
    ? materials.filter(material => material.course_id.toString() === courseId)
    : materials

  const handleAddToAI = async (material: StudentMaterial) => {
    try {
      const response = await apiClient.addMaterialToAI(material.id.toString())
      
      if (response.success) {
        toast({
          title: "✅ Added to AI Chat",
          description: `"${material.title}" is now in your AI context. Go to AI Assistant tab!`,
          className: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-200",
          duration: 3000, // Auto-dismiss after 3 seconds
        })
      } else {
        throw new Error(response.error || 'Failed to add material')
      }
    } catch (error: any) {
      console.error('Add to AI error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add material to AI chat",
        variant: "destructive",
        duration: 4000,
      })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'pptx':
        return <FileSpreadsheet className="w-5 h-5 text-orange-500" />
      case 'docx':
        return <FileImage className="w-5 h-5 text-blue-500" />
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getFileTypeBadge = (type: string) => {
    const colors = {
      pdf: 'bg-red-500/20 text-red-400 border-red-500/30',
      pptx: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      docx: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      video: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    
    return (
      <Badge className={`glassmorphic ${colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400'}`}>
        {type.toUpperCase()}
      </Badge>
    )
  }

  if (filteredMaterials.length === 0) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Materials Found</h3>
          <p className="text-muted-foreground">
            {courseId ? 'Select a course to view materials' : 'No materials available'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h2 className="text-xl font-semibold text-foreground mb-2">Course Materials</h2>
        <Badge variant="secondary" className="glassmorphic">
          {filteredMaterials.length} Files
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="glassmorphic hover:glow-cyan transition-all duration-300">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getFileIcon(material.type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium text-foreground leading-tight">
                        {material.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        <div className="flex items-center space-x-4 mb-1">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(material.upload_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {material.size || 'Unknown size'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          <span>{material.course_code}: {material.course_name}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  {getFileTypeBadge(material.type)}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glassmorphic hover:glow-cyan flex-1"
                    onClick={() => handleAddToAI(material)}
                  >
                    <Bot className="w-3 h-3 mr-2" />
                    Add to AI Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glassmorphic hover:glow-green flex-1"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token')
                        if (!token) {
                          console.error('No auth token found')
                          return
                        }

                        const downloadUrl = `http://localhost:5000/api/student/materials/${material.id}/download`
                        console.log('Downloading:', downloadUrl)

                        const response = await fetch(downloadUrl, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })

                        if (!response.ok) {
                          const errorData = await response.json()
                          console.error('Download failed:', errorData.message)
                          alert(`Download failed: ${errorData.message}`)
                          return
                        }

                        // Get the actual file blob
                        const blob = await response.blob()
                        
                        // Create download link
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = material.title
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        window.URL.revokeObjectURL(url)

                        console.log('Download successful:', material.title)
                      } catch (error) {
                        console.error('Download error:', error)
                        alert('Download failed. Please try again.')
                      }
                    }}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {material.type === 'video' ? 'Watch' : 'Download'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

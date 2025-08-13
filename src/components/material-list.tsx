"use client"

import { Material } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, FileSpreadsheet, FileImage, Video, Download, Calendar, Clock } from "lucide-react"

interface MaterialListProps {
  materials: Material[]
  courseId?: string
}

/**
 * MaterialList component displays course materials with download functionality
 * Shows different icons based on file type and includes glassmorphic styling
 */
export function MaterialList({ materials, courseId }: MaterialListProps) {
  const filteredMaterials = courseId 
    ? materials.filter(material => material.courseId === courseId)
    : materials

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
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(material.uploadDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {material.size}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  {getFileTypeBadge(material.type)}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="glassmorphic hover:glow-green"
                    onClick={() => {
                      // Mock download functionality
                      if (material.type === 'video') {
                        window.open(material.url, '_blank')
                      } else {
                        // For demo purposes, show alert instead of trying to download non-existent files
                        alert(`Demo: Would download "${material.title}" (${material.size})`)
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

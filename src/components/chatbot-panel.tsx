"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Paperclip, X, Loader2, FileText } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  id: string
  message: string
  isBot: boolean
  timestamp: Date
}

interface AIContext {
  materials: Array<{
    id: number
    title: string
    course_name: string
  }>
}

/**
 * ChatbotPanel component provides an AI chatbot interface for student assistance
 * Features: Real AI integration, file uploads, material context, loading states
 */
export function ChatbotPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [context, setContext] = useState<AIContext>({ materials: [] })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
    loadContext()
  }, [])

  const loadContext = async () => {
    try {
      const response = await apiClient.getAIContext()
      if (response.success && response.data) {
        const data = response.data as any
        if (data.context && data.context.materials) {
          setContext({ materials: data.context.materials })
        }
      }
    } catch (error) {
      console.error('Failed to load AI context:', error)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await apiClient.getAIChatHistory()
      
      if (response.success && response.data) {
        const data = response.data as any
        const history = data.history || []
        
        // Convert history to messages
        const loadedMessages: ChatMessage[] = history.flatMap((interaction: any) => [
          {
            id: `query-${interaction.id}`,
            message: interaction.query,
            isBot: false,
            timestamp: new Date(interaction.created_at)
          },
          {
            id: `response-${interaction.id}`,
            message: interaction.response,
            isBot: true,
            timestamp: new Date(interaction.created_at)
          }
        ])

        setMessages(loadedMessages)
        
        // Load context
        if (data.context) {
          setContext(data.context)
        }
      }

      // If no history, show welcome message
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          message: 'Hello! I\'m your AI learning assistant. I can help you with:\n\n• Understanding course materials\n• Explaining complex topics\n• Solving homework problems\n• Answering questions about your courses\n\nYou can also attach files or add study materials to our conversation!',
          isBot: true,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return

    setLoading(true)

    try {
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        message: input || (selectedFile ? `[Attached: ${selectedFile.name}]` : ''),
        isBot: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setInput('')

      // Send to API
      const response = await apiClient.sendAIMessage(input, selectedFile || undefined)
      
      if (response.success && response.data) {
        const data = response.data as any
        
        // Add bot response
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          message: data.message || data.response, // Support both field names
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])

        // Clear file
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error(response.error || 'Failed to get AI response')
      }
    } catch (error: any) {
      console.error('AI chat error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        message: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeMaterialFromContext = async (materialId: number) => {
    try {
      await apiClient.removeAIMaterial(materialId)
      setContext(prev => ({
        materials: prev.materials.filter(m => m.id !== materialId)
      }))
      toast({
        title: "Material removed",
        description: "Material removed from AI context",
        className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
      })
    } catch (error) {
      console.error('Failed to remove material:', error)
    }
  }

  return (
    <Card className="h-full glassmorphic flex flex-col">
      <CardHeader className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <div>
              <CardTitle className="text-sm font-medium text-foreground">AI Learning Assistant</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Powered by GLM 4.5 Air
              </CardDescription>
            </div>
          </div>
          
          {context.materials.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {context.materials.length} material{context.materials.length > 1 ? 's' : ''} loaded
            </Badge>
          )}
        </div>

        {/* Show loaded materials */}
        {context.materials.length > 0 && (
          <div className="mt-3 space-y-1">
            {context.materials.map(material => (
              <div key={material.id} className="flex items-center justify-between p-2 glassmorphic rounded text-xs">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span className="text-foreground">{material.title}</span>
                  <span className="text-muted-foreground">({material.course_name})</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMaterialFromContext(material.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="ml-2 text-muted-foreground text-xs">Loading chat history...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.isBot ? '' : 'flex-row-reverse space-x-reverse'
                  }`}
                >
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className={`text-xs ${
                      message.isBot ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {message.isBot ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg glassmorphic text-xs ${
                      message.isBot
                        ? 'bg-white/5 border border-cyan-500/20'
                        : 'bg-purple-500/20 border border-purple-500/30'
                    }`}
                  >
                    <p className="text-foreground whitespace-pre-wrap">{message.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-cyan-500/20 text-cyan-400">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg glassmorphic bg-white/5 border border-cyan-500/20">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                      <span className="text-xs text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10 flex-shrink-0 space-y-2">
          {/* Show selected file */}
          {selectedFile && (
            <div className="flex items-center justify-between p-2 glassmorphic rounded border border-cyan-500/20">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-foreground">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFile}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Attached Materials Indicator (Gemini-style) */}
            {context.materials && context.materials.length > 0 && (
              <div className="mb-4 p-3 glassmorphic rounded-lg border border-cyan-500/30">
                <p className="text-xs text-muted-foreground mb-2 flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Attached Materials ({context.materials.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {context.materials.map((material) => (
                    <div 
                      key={material.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs"
                    >
                      <FileText className="w-3 h-3 text-cyan-400" />
                      <span className="text-foreground truncate max-w-[150px]">
                        {material.title}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {material.course_name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="glassmorphic hover:glow-purple flex-shrink-0"
              disabled={loading}
            >
              <Paperclip className="w-3 h-3" />
            </Button>
            <Input
              placeholder="Ask me anything about your courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="glassmorphic border-white/20 focus:border-cyan-500/50 text-xs"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="glassmorphic hover:glow-cyan flex-shrink-0"
              disabled={(!input.trim() && !selectedFile) || loading}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

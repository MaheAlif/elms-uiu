"use client"

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle, Users, Trash2 } from "lucide-react"
import { useSocket } from '@/lib/socket'
import { useToast } from '@/hooks/use-toast'

interface ClassChatPanelProps {
  courseId: number
  courseName: string
  currentUserId: number
  currentUserName: string
}

/**
 * ClassChatPanel component provides real-time class discussion functionality
 * Displays chat messages with user avatars and allows sending new messages
 */
export function ClassChatPanel({ 
  courseId, 
  courseName,
  currentUserId, 
  currentUserName 
}: ClassChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [roomId, setRoomId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<number>(0)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { socket, isConnected, joinRoom, leaveRoom, sendMessage, onMessage, onUserJoined, onUserLeft, onTyping, onStoppedTyping, onMessageDeleted, startTyping, stopTyping, deleteMessage } = useSocket()
  const { toast } = useToast()

  // Load chat room and history
  useEffect(() => {
    const loadChat = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('🔍 Loading chat for courseId:', courseId)
        const response = await fetch(`http://localhost:5000/api/student/courses/${courseId}/chat`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📡 Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ Error response:', errorData)
          throw new Error(errorData.message || 'Failed to load chat')
        }

        const data = await response.json()
        console.log('✅ Chat data:', data)
        
        if (data.success) {
          setRoomId(data.data.room.id)
          setMessages(data.data.messages)
          setParticipants(data.data.participants.length)
          
          // Join the Socket.IO room
          if (socket && data.data.room.id) {
            joinRoom(data.data.room.id, courseId, currentUserId)
          }
        }
      } catch (error) {
        console.error('Load chat error:', error)
        toast({
          title: "Error",
          description: "Failed to load chat. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadChat()

    return () => {
      if (roomId) {
        leaveRoom(roomId)
      }
    }
  }, [courseId, currentUserId, socket])

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return

    onMessage((data: ChatMessage) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === data.id)
        if (exists) return prev
        return [...prev, data]
      })
      
      // Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    onUserJoined((data: { userId: number; userName: string }) => {
      if (data.userId !== currentUserId) {
        toast({
          title: "User Joined",
          description: `${data.userName} joined the chat`,
          variant: "default",
          className: "bg-green-500/10 border-green-500/50 text-green-400"
        })
      }
    })

    onUserLeft((data: { userId: number; userName: string }) => {
      toast({
        title: "User Left",
        description: `${data.userName} left the chat`,
        className: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
      })
    })

    onTyping((data: { userId: number; userName: string }) => {
      if (data.userId !== currentUserId) {
        setTypingUsers(prev => new Set(prev).add(data.userName))
      }
    })

    onStoppedTyping((data: { userId: number }) => {
      if (data.userId !== currentUserId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          // Remove by userId - find the userName
          const userEntry = Array.from(newSet).find(() => true) // Simplified
          if (userEntry) newSet.delete(userEntry)
          return newSet
        })
      }
    })

    onMessageDeleted((data: { messageId: number }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId))
      toast({
        title: "Message Deleted",
        description: "A message was removed from the chat",
        variant: "destructive"
      })
    })
  }, [socket, currentUserId])

  const handleSendMessage = async () => {
    if (!input.trim() || !roomId) return

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    stopTyping(roomId, currentUserId)

    // Send via Socket.IO (will be saved to DB and broadcast)
    sendMessage({
      roomId,
      message: input.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      messageType: 'text'
    })

    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    if (!roomId) return

    // Send typing indicator
    startTyping(roomId, currentUserId, currentUserName)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId, currentUserId)
    }, 2000)
  }

  const handleDeleteMessage = async (messageId: number | string) => {
    if (!roomId) return
    
    deleteMessage(Number(messageId), roomId, currentUserId)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="h-full glassmorphic flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">Loading chat...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full glassmorphic flex flex-col">
      <CardHeader className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-green-400" />
              {isConnected && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-foreground">Class Discussion</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {courseName}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{participants} members</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const displayName = message.sender_name || message.sender || 'Unknown'
              const isOwnMessage = message.sender_id === currentUserId || message.isCurrentUser
              // Use combination of id and index as fallback for unique key
              const messageKey = `${message.id}-${message.timestamp || index}`
              
              return (
                <div key={messageKey} className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 min-w-0 ${isOwnMessage ? 'items-end' : ''}`}>
                    <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="text-xs font-medium text-foreground">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div className={`glassmorphic p-3 rounded-lg ${isOwnMessage ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/10'} border group relative`}>
                      <p className="text-xs text-foreground leading-relaxed">{message.message}</p>
                      {isOwnMessage && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {typingUsers.size > 0 && (
              <div className="text-xs text-muted-foreground italic">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="glassmorphic border-white/20 focus:border-green-500/50 text-xs"
              disabled={!isConnected}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="glassmorphic hover:glow-green"
              disabled={!input.trim() || !isConnected}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-400 mt-2">Disconnected. Reconnecting...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

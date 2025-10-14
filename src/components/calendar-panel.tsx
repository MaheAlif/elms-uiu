"use client"

import { CalendarEvent } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, BookOpen, FileText, Users, GraduationCap } from "lucide-react"
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface CalendarPanelProps {
  events: CalendarEvent[]
}

interface HoverPopupProps {
  events: CalendarEvent[]
  position: { x: number; y: number }
}

function HoverPopup({ events, position }: HoverPopupProps) {
  if (events.length === 0) return null

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-3 h-3" />
      case 'exam':
        return <GraduationCap className="w-3 h-3" />
      case 'class':
        return <BookOpen className="w-3 h-3" />
      case 'meeting':
        return <Users className="w-3 h-3" />
      default:
        return <CalendarDays className="w-3 h-3" />
    }
  }

  const getEventBadgeStyle = (type: string) => {
    const styles = {
      assignment: 'bg-red-500/20 text-red-400 border-red-500/30',
      exam: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      class: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      meeting: 'bg-green-500/20 text-green-400 border-green-500/30'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-500/20 text-gray-400'
  }

  const getDaysLeft = (eventDate: Date) => {
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days left`
  }

  const getCourseName = (courseId?: string) => {
    const courseNames: { [key: string]: string } = {
      '1': 'Advanced React Development',
      '2': 'Machine Learning Fundamentals', 
      '3': 'Database Design & SQL',
      '4': 'Cybersecurity Essentials'
    }
    return courseId ? courseNames[courseId] || 'Unknown Course' : 'General'
  }

  const formatEventMessage = (event: CalendarEvent) => {
    const courseName = getCourseName(event.courseId)
    const daysLeft = getDaysLeft(event.date)
    
    switch (event.type) {
      case 'assignment':
        return `Your ${courseName}'s assignment "${event.title}" deadline is ${event.date.toLocaleDateString()}! ${daysLeft} to submit it.`
      case 'exam':
        return `Your ${courseName}'s exam "${event.title}" is scheduled for ${event.date.toLocaleDateString()}! ${daysLeft} to prepare.`
      case 'class':
        return `${courseName} class "${event.title}" is scheduled for ${event.date.toLocaleDateString()}. ${daysLeft}.`
      case 'meeting':
        return `"${event.title}" meeting is scheduled for ${event.date.toLocaleDateString()}. ${daysLeft}.`
      default:
        return `"${event.title}" is scheduled for ${event.date.toLocaleDateString()}. ${daysLeft}.`
    }
  }

  const popupContent = (
    <div 
      className="fixed z-[9999] glassmorphic border border-white/20 rounded-lg p-4 max-w-sm shadow-xl pointer-events-none"
      style={{ 
        left: Math.min(position.x + 10, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 350), 
        top: Math.max(position.y - 10, 10),
        transform: position.y > 200 ? 'translateY(-100%)' : 'none'
      }}
    >
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-start space-x-2 mb-2">
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{event.title}</span>
                  <Badge className={`glassmorphic text-xs ${getEventBadgeStyle(event.type)}`}>
                    {event.type}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {formatEventMessage(event)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  // Use portal to render outside of component tree to avoid z-index issues
  return typeof document !== 'undefined' ? createPortal(popupContent, document.body) : null
}

/**
 * CalendarPanel component displays a monthly calendar with highlighted assignment deadlines
 * and upcoming events with different glowing borders based on event type
 */
export function CalendarPanel({ events }: CalendarPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const generateCalendarDays = (): (Date | null)[] => {
    const currentMonth = selectedDate || new Date()
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    // Generate 42 days (6 weeks)
    const days: (Date | null)[] = []
    const currentDate = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-3 h-3" />
      case 'exam':
        return <GraduationCap className="w-3 h-3" />
      case 'class':
        return <BookOpen className="w-3 h-3" />
      case 'meeting':
        return <Users className="w-3 h-3" />
      default:
        return <CalendarDays className="w-3 h-3" />
    }
  }

  const getEventBadgeStyle = (type: string) => {
    const styles = {
      assignment: 'bg-red-500/20 text-red-400 border-red-500/30',
      exam: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      class: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      meeting: 'bg-green-500/20 text-green-400 border-green-500/30'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-500/20 text-gray-400'
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []
  const hoveredDateEvents = hoveredDate ? getEventsForDate(hoveredDate) : []

  const hasEvents = (date: Date) => {
    return events.some(event => event.date.toDateString() === date.toDateString())
  }

  const hasDeadlines = (date: Date) => {
    return events.some(event => 
      event.date.toDateString() === date.toDateString() && 
      (event.type === 'assignment' || event.type === 'exam')
    )
  }

  const hasRegularEvents = (date: Date) => {
    return events.some(event => 
      event.date.toDateString() === date.toDateString() && 
      (event.type === 'class' || event.type === 'meeting')
    )
  }

  const hasUniversityEvents = (date: Date) => {
    return events.some(event => 
      event.date.toDateString() === date.toDateString() && 
      (event.type === 'university_event' || event.type === 'holiday' || event.type === 'exam_week' || 
       event.type === 'registration' || event.type === 'orientation' || event.type === 'graduation' || 
       event.type === 'maintenance' || event.type === 'event')
    )
  }

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    const dayEvents = getEventsForDate(date)
    
    if (dayEvents.length > 0) {
      setHoveredDate(date)
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDate(null)
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2025'}
              </h2>
              <div className="flex items-center space-x-1">
                <button 
                  className="p-1.5 hover:bg-accent rounded-md transition-colors"
                  onClick={() => {
                    const newDate = new Date(selectedDate || new Date())
                    newDate.setMonth(newDate.getMonth() - 1)
                    setSelectedDate(newDate)
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 hover:bg-accent rounded-md transition-colors"
                  onClick={() => {
                    const newDate = new Date(selectedDate || new Date())
                    newDate.setMonth(newDate.getMonth() + 1)
                    setSelectedDate(newDate)
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col min-h-0 max-h-full">
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days - Square Grid */}
              <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr max-h-[350px]">
                {generateCalendarDays().map((day, index) => {
                  const isToday = day && day.toDateString() === new Date().toDateString()
                  const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()
                  const hasDeadlineEvents = day && hasDeadlines(day)
                  const hasRegularEventsOnly = day && hasRegularEvents(day) && !hasDeadlines(day) && !hasUniversityEvents(day)
                  const hasUniversityEventsOnly = day && hasUniversityEvents(day) && !hasDeadlines(day)
                  const dayEvents = day ? getEventsForDate(day) : []
                  
                  return (
                    <div
                      key={index}
                      className={`
                        relative flex items-center justify-center text-sm cursor-pointer rounded transition-all duration-200 min-h-[40px]
                        ${!day ? 'invisible' : ''}
                        ${day && day.getMonth() !== (selectedDate || new Date()).getMonth() ? 'text-muted-foreground opacity-50' : 'text-foreground'}
                        ${isToday ? 'bg-blue-500 text-white font-semibold' : ''}
                        ${isSelected && !isToday ? 'bg-accent text-accent-foreground' : ''}
                        ${!isToday && !isSelected ? 'hover:bg-accent/50' : ''}
                        ${hasDeadlineEvents ? 'deadline-glow' : ''}
                        ${hasRegularEventsOnly ? 'event-glow' : ''}
                        ${hasUniversityEventsOnly ? 'university-event-glow' : ''}
                      `}
                      onClick={() => day && setSelectedDate(day)}
                      onMouseEnter={(e) => {
                        if (day) {
                          handleMouseEnter(day, e)
                        }
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      {day && (
                        <>
                          <span>{day.getDate()}</span>
                          {dayEvents.length > 0 && (
                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                              {dayEvents.slice(0, 3).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-0.5 h-0.5 rounded-full ${
                                    hasDeadlineEvents ? 'bg-red-400' : 'bg-yellow-400'
                                  }`} 
                                />
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
      
      {hoveredDate && hoveredDateEvents.length > 0 && (
        <HoverPopup events={hoveredDateEvents} position={mousePosition} />
      )}
    </>
  )
}

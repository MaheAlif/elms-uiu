"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ChevronDown, User, Users, Shield, UserPlus, AlertCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface RegisterFormProps {
  showBackground?: boolean
  className?: string
}

export function RegisterForm({ showBackground = false, className = "" }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'teacher' | 'admin'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const roles = [
    { value: 'student', label: 'Student', icon: User, color: 'text-cyan-400' },
    { value: 'teacher', label: 'Teacher', icon: Users, color: 'text-purple-400' },
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'text-green-400' }
  ]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      // Call registration API
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Registration successful! Logging you in...')
        
        // Automatically login after successful registration
        setTimeout(async () => {
          const loginResult = await login(formData.email, formData.password, formData.role)
          if (loginResult.success) {
            router.push(loginResult.redirect_url || '/dashboard')
          } else {
            // If auto-login fails, redirect to login page
            router.push('/login')
          }
        }, 1500)
        
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error - please check if the server is running on port 5000')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRoleData = roles.find(role => role.value === formData.role)

  return (
    <div className={`w-full max-w-md ${className}`}>
      {/* Back to Login Link */}
      <div className="mb-6">
        <Link 
          href="/login"
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>
      </div>

      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full glassmorphic glow-cyan ${showBackground ? 'backdrop-blur-xl' : ''}`}>
            <GraduationCap className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Join ELMS</h1>
        <p className="text-muted-foreground">Create your account to get started</p>
      </div>

      {/* Registration Form */}
      <Card className={`glassmorphic glow-purple ${showBackground ? 'backdrop-blur-xl border-white/20' : ''}`}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center text-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your information to create your ELMS account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Success Message */}
          {success && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 ${showBackground ? 'backdrop-blur-md' : ''}`}>
              <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              <span className="text-sm text-green-600 dark:text-green-400">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 ${showBackground ? 'backdrop-blur-md' : ''}`}>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`glassmorphic border-white/20 focus:border-cyan-500/50 ${showBackground ? 'backdrop-blur-md' : ''}`}
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`glassmorphic border-white/20 focus:border-cyan-500/50 ${showBackground ? 'backdrop-blur-md' : ''}`}
                required
                disabled={isLoading}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-between glassmorphic hover:glow-cyan ${showBackground ? 'backdrop-blur-md border-white/20' : ''}`}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      {selectedRoleData && (
                        <>
                          <selectedRoleData.icon className={`w-4 h-4 ${selectedRoleData.color}`} />
                          <span>{selectedRoleData.label}</span>
                        </>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`w-full glassmorphic ${showBackground ? 'backdrop-blur-xl border-white/20' : ''}`}>
                  {roles.map((role) => (
                    <DropdownMenuItem
                      key={role.value}
                      onClick={() => setFormData({...formData, role: role.value as any})}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <role.icon className={`w-4 h-4 ${role.color}`} />
                      <span>{role.label}</span>
                      {formData.role === role.value && (
                        <Badge variant="secondary" className="ml-auto">
                          Selected
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`glassmorphic border-white/20 focus:border-cyan-500/50 ${showBackground ? 'backdrop-blur-md' : ''}`}
                required
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={`glassmorphic border-white/20 focus:border-cyan-500/50 ${showBackground ? 'backdrop-blur-md' : ''}`}
                required
                disabled={isLoading}
              />
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              className={`w-full glassmorphic hover:glow-green ${showBackground ? 'backdrop-blur-md' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account as {selectedRoleData?.label}</span>
                </div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ChevronDown, User, Users, Shield, LogIn, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface LoginFormProps {
  showBackground?: boolean
  className?: string
}

/**
 * Reusable login form component with role selection and glassmorphic design
 * Can be used with or without animated background
 */
export function LoginForm({ showBackground = false, className = "" }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const roles = [
    { value: 'student', label: 'Student', icon: User, color: 'text-cyan-400' },
    { value: 'teacher', label: 'Teacher', icon: Users, color: 'text-purple-400' },
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'text-green-400' }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(email, password, selectedRole)
      
      if (result.success) {
        // Redirect to the URL provided by the backend
        router.push(result.redirect_url || '/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error - please check if the server is running on port 5000')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRoleData = roles.find(role => role.value === selectedRole)

  return (
    <div className={`w-full max-w-md ${className}`}>
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full glassmorphic glow-cyan ${showBackground ? 'backdrop-blur-xl' : ''}`}>
            <GraduationCap className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ELMS</h1>
        <p className="text-muted-foreground">E-Learning Management System</p>
        {showBackground && (
          <p className="text-xs text-white/60 mt-2">✨ Enhanced with Animated Background</p>
        )}
      </div>

      {/* Login Form */}
      <Card className={`glassmorphic glow-purple ${showBackground ? 'backdrop-blur-xl border-white/20' : ''}`}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to access your learning dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 ${showBackground ? 'backdrop-blur-md' : ''}`}>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-between glassmorphic hover:glow-cyan ${showBackground ? 'backdrop-blur-md border-white/20' : ''}`}
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
                      onClick={() => setSelectedRole(role.value as 'student' | 'teacher' | 'admin')}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <role.icon className={`w-4 h-4 ${role.color}`} />
                      <span>{role.label}</span>
                      {selectedRole === role.value && (
                        <Badge variant="secondary" className="ml-auto">
                          Selected
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`glassmorphic border-white/20 focus:border-cyan-500/50 ${showBackground ? 'backdrop-blur-md' : ''}`}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`glassmorphic border-white/20 focus:border-cyan-500/50 ${showBackground ? 'backdrop-blur-md' : ''}`}
                required
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className={`w-full glassmorphic hover:glow-green ${showBackground ? 'backdrop-blur-md' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as {selectedRoleData?.label}</span>
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className={`mt-6 p-4 glassmorphic rounded-lg border border-white/10 ${showBackground ? 'backdrop-blur-md' : ''}`}>
            <h4 className="text-sm font-medium text-foreground mb-2">Test Credentials</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Student:</strong> sakib221131@bscse.uiu.ac.bd</p>
              <p><strong>Teacher:</strong> sarah.johnson@uiu.ac.bd</p>
              <p><strong>Admin:</strong> admin.aminul@uiu.ac.bd</p>
              <p><strong>Password:</strong> password123 (for all accounts)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className={`text-center mt-8 text-sm ${showBackground ? 'text-white/60 drop-shadow' : 'text-muted-foreground'}`}>
        <p>© 2024 ELMS - E-Learning Management System</p>
        {showBackground && (
          <p className="text-xs mt-1">🎨 Powered by animated backgrounds</p>
        )}
      </div>
    </div>
  )
}

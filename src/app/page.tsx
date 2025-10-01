"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

/**
 * Main login page with simple glassmorphic design
 * Includes option to switch to animated login page
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Navigation Links */}
      <div className="absolute top-6 right-6 flex items-center space-x-3">
        <Link 
          href="/register"
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors glassmorphic p-3 rounded-lg hover:glow-cyan"
        >
          <span className="text-sm font-medium">Register</span>
        </Link>
        <Link 
          href="/login"
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors glassmorphic p-3 rounded-lg hover:glow-purple"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Animated Login</span>
        </Link>
      </div>
      
      {/* Login Form Component */}
      <LoginForm showBackground={false} />
    </div>
  )
}

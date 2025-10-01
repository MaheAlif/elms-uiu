"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Link to Animated Register */}
      <Link 
        href="/register/animated"
        className="absolute top-6 right-6 flex items-center space-x-2 text-white/70 hover:text-white transition-colors glassmorphic p-3 rounded-lg hover:glow-purple"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Animated Register</span>
      </Link>
      
      {/* Register Form Component */}
      <RegisterForm showBackground={false} />
    </div>
  )
}
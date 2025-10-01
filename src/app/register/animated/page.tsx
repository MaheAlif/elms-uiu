"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"
import PulsingCircle from "@/components/backgrounds/pulsing-circle"

export default function AnimatedRegisterPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <PulsingCircle />
      </div>
      
      {/* Back Link */}
      <Link 
        href="/register"
        className="absolute top-6 left-6 flex items-center space-x-2 text-white/70 hover:text-white transition-colors glassmorphic p-3 rounded-lg hover:glow-cyan backdrop-blur-xl z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Simple Register</span>
      </Link>
      
      {/* Register Form Component with animated background */}
      <div className="relative z-10">
        <RegisterForm showBackground={true} />
      </div>
    </div>
  )
}
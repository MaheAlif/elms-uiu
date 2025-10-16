"use client"

import { useAuth } from './auth/auth-provider'
import { SocketProvider } from '@/lib/socket'

export function SocketWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  return (
    <SocketProvider 
      userId={isAuthenticated && user ? user.id : undefined}
      userName={isAuthenticated && user ? user.name : undefined}
    >
      {children}
    </SocketProvider>
  )
}

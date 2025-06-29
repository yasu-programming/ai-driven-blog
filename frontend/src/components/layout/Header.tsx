"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          AI Driven Blog
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link href="/posts" className="text-muted-foreground hover:text-foreground">
            Posts
          </Link>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          {user && (
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          )}
        </nav>
        
        <div className="flex space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.name}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
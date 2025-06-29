import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
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
        </nav>
        
        <div className="flex space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
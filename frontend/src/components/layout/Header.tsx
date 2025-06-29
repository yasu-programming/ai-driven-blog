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
AI駆動ブログ
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
ホーム
          </Link>
          <Link href="/posts" className="text-muted-foreground hover:text-foreground">
記事
          </Link>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
カテゴリー
          </Link>
          {user && (
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
ダッシュボード
            </Link>
          )}
        </nav>
        
        <div className="flex space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/posts/create">記事作成</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
ようこそ、{user.name}さん
              </span>
              <Button variant="ghost" onClick={handleLogout}>
ログアウト
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild>
                <Link href="/register">アカウント作成</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
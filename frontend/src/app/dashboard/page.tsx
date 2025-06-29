"use client"

import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground mt-2">
              おかえりなさい、{user?.name}さん！
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
ログアウト
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>私の記事</CardTitle>
              <CardDescription>
                ブログ記事を管理する
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">総記事数</p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/posts">記事管理</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>記事作成</CardTitle>
              <CardDescription>
                新しいブログ記事を書き始める
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  あなたの思いを世界と共有しましょう
                </p>
                <Button asChild className="w-full">
                  <Link href="/posts/create">新しい記事</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>プロフィール</CardTitle>
              <CardDescription>
                アカウント設定を管理する
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" className="w-full">
プロフィール編集
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
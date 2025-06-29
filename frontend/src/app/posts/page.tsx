"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api'

interface Post {
  id: number
  title: string
  content: string
  summary?: string
  status: string
  published_at?: string
  author: {
    id: number
    name: string
  }
  category?: {
    id: number
    name: string
  }
  tags: Array<{
    id: number
    name: string
  }>
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface PostsResponse {
  data: Post[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPosts = async (page = 1, searchQuery = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12',
      })
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?${params}`)
      
      if (!response.ok) {
        throw new Error('記事の取得に失敗しました')
      }

      const data = await response.json()
      setPosts(data.data.data)
      setPagination({
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        per_page: data.data.per_page,
        total: data.data.total,
        from: data.data.from,
        to: data.data.to,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : '記事の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(currentPage, search)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts(1, search)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '下書き'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">ブログ記事</h1>
            <p className="text-muted-foreground mt-2">
              コミュニティからの記事と洞察を発見しましょう
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <Input
            type="text"
            placeholder="記事を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit">検索</Button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchPosts(currentPage, search)}>
              再試行
            </Button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && (
          <>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">記事が見つかりません。</p>
                {search && (
                  <Button 
                    onClick={() => {
                      setSearch('')
                      setCurrentPage(1)
                      fetchPosts(1, '')
                    }}
                    className="mt-4"
                  >
検索をクリア
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="line-clamp-2 text-lg">
                            <Link 
                              href={`/posts/${post.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                          </CardTitle>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </div>
                        <CardDescription>
{post.author.name} が投稿 • {formatDate(post.published_at)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {post.summary || truncateContent(post.content)}
                        </p>
                        
                        {/* Category and Tags */}
                        <div className="space-y-2">
                          {post.category && (
                            <div>
                              <Badge variant="outline">{post.category.name}</Badge>
                            </div>
                          )}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <Button variant="link" className="mt-4 p-0" asChild>
                          <Link href={`/posts/${post.id}`}>
詳しく読む →
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
前へ
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        let pageNumber
                        if (pagination.last_page <= 5) {
                          pageNumber = i + 1
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (currentPage >= pagination.last_page - 2) {
                          pageNumber = pagination.last_page - 4 + i
                        } else {
                          pageNumber = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= pagination.last_page}
                    >
次へ
                    </Button>
                  </div>
                )}

                {/* Results Info */}
                {pagination && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
{pagination.total}件中 {pagination.from}-{pagination.to}件を表示
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
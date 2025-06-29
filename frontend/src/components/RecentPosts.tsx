"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?per_page=6&status=published`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await response.json()
        setPosts(data.data.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch posts')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPosts()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Draft'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-muted-foreground">
          Unable to load recent posts. Please try again later.
        </p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg">No posts available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later for new content!
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              By {post.author.name} • {formatDate(post.published_at)}
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
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <Button variant="link" className="mt-4 p-0" asChild>
              <Link href={`/posts/${post.id}`}>
                Read More →
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
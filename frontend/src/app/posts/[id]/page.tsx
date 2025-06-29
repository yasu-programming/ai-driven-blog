"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Calendar, User, Tag, Folder } from 'lucide-react'

interface Post {
  id: number
  title: string
  content: string
  summary?: string
  status: string
  published_at?: string
  created_at: string
  updated_at: string
  meta_description?: string
  featured_image?: string
  author: {
    id: number
    name: string
    email: string
  }
  category?: {
    id: number
    name: string
    slug: string
  }
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found')
          }
          throw new Error('Failed to fetch post')
        }

        const data = await response.json()
        setPost(data.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch post')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatContent = (content: string) => {
    // Simple content formatting - split by double newlines to create paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph.trim()}
      </p>
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
            <Button variant="outline" asChild>
              <Link href="/posts">
                Browse Posts
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Post Header */}
        <div className="space-y-4">
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
              {post.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {post.category.name}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {post.title}
            </h1>
            
            {post.summary && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.summary}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>By {post.author.name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {post.published_at 
                  ? `Published ${formatDate(post.published_at)}`
                  : `Created ${formatDate(post.created_at)}`
                }
              </span>
            </div>

            {post.published_at !== post.updated_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {formatDate(post.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <Card>
          <CardContent className="prose prose-lg max-w-none pt-6">
            <div className="text-foreground">
              {formatContent(post.content)}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {post.tags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Tags</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/posts">
              ← All Posts
            </Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Post ID: {post.id}
          </div>
        </div>
      </div>
    </div>
  )
}
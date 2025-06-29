"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { X, Save, Eye, Upload } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category_id: '',
    status: 'draft',
    meta_description: '',
    featured_image: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchCategories()
  }, [user, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTagInput.trim() && !selectedTags.find(tag => tag.name.toLowerCase() === newTagInput.toLowerCase())) {
      const newTag: Tag = {
        id: Date.now(), // Temporary ID for new tags
        name: newTagInput.trim(),
        slug: newTagInput.trim().toLowerCase().replace(/\s+/g, '-')
      }
      setSelectedTags([...selectedTags, newTag])
      setNewTagInput('')
    }
  }

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId))
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    try {
      setLoading(true)
      setError(null)

      const tagNames = selectedTags.map(tag => tag.name)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          status,
          tags: tagNames
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create post')
      }

      const data = await response.json()
      router.push(`/posts/${data.data.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">新しい記事を作成</h1>
            <p className="text-muted-foreground">ブログ記事を書いて投稿しましょう</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
キャンセル
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit('draft')}
              disabled={loading || !formData.title.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
下書き保存
            </Button>
            <Button 
              onClick={() => handleSubmit('published')}
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              <Eye className="mr-2 h-4 w-4" />
公開
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>記事内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="記事のタイトルを入力してください..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">概要</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="記事の簡潔な概要..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="content">内容 *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="記事の内容をここに書いてください..."
                    rows={15}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO設定</CardTitle>
                <CardDescription>
                  検索エンジン向けに記事を最適化
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_description">メタディスクリプション</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="SEO用のメタディスクリプション..."
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.meta_description.length}/160 文字
                  </p>
                </div>

                <div>
                  <Label htmlFor="featured_image">アイキャッチ画像URL</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => handleInputChange('featured_image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>公開設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">カテゴリー</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="カテゴリーを選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">ステータス</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="published">公開済み</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>タグ</CardTitle>
                <CardDescription>
                  記事を分類するためのタグを追加
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="タグを追加..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} size="sm">
追加
                  </Button>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1 hover:bg-red-600 hover:text-white rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post Preview */}
            <Card>
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2">
                    {formData.title || '記事タイトル'}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.summary || formData.content.substring(0, 100) + '...' || '記事内容のプレビュー...'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {selectedTags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedTags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
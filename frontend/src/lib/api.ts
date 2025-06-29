const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface Post {
  id: number
  title: string
  content: string
  summary?: string
  author_id: number
  category_id?: number
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Posts API
  async getPosts(): Promise<ApiResponse<Post[]>> {
    return this.request('/posts')
  }

  async getPost(id: string): Promise<ApiResponse<Post>> {
    return this.request(`/posts/${id}`)
  }

  async createPost(post: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    })
  }

  async updatePost(id: string, post: Partial<Post>): Promise<ApiResponse<Post>> {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    })
  }

  async deletePost(id: string): Promise<ApiResponse<void>> {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // AI API
  async proofreadText(text: string): Promise<ApiResponse<{ corrected_text: string }>> {
    return this.request('/ai/proofread', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  }

  async generateTags(content: string): Promise<ApiResponse<{ tags: string[] }>> {
    return this.request('/ai/generate-tags', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async summarizeContent(content: string): Promise<ApiResponse<{ summary: string }>> {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async optimizeSEO(content: string): Promise<ApiResponse<{ meta_description: string, keywords: string[] }>> {
    return this.request('/ai/seo-optimize', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  // Media API
  async uploadMedia(file: File): Promise<ApiResponse<{ url: string, id: number }>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request('/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      } as any,
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['author', 'category', 'tags']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default to published posts for public API
            $query->published();
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by author
        if ($request->has('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'published_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $posts = $query->paginate($perPage);

        return response()->json([
            'message' => 'Posts retrieved successfully',
            'data' => $posts
        ]);
    }

    public function show($id)
    {
        $post = Post::with(['author', 'category', 'tags'])->find($id);

        if (!$post) {
            return response()->json([
                'message' => 'Post not found'
            ], 404);
        }

        // Only show published posts to non-authors
        if ($post->status !== 'published' && 
            (!auth()->check() || auth()->id() !== $post->author_id)) {
            return response()->json([
                'message' => 'Post not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Post retrieved successfully',
            'data' => $post
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'summary' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'in:draft,published,archived',
            'meta_description' => 'nullable|string|max:160',
            'featured_image' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'summary' => $request->summary,
            'author_id' => auth()->id(),
            'category_id' => $request->category_id,
            'status' => $request->get('status', 'draft'),
            'published_at' => $request->status === 'published' ? now() : null,
            'meta_description' => $request->meta_description,
            'featured_image' => $request->featured_image,
        ]);

        // Handle tags
        if ($request->has('tags') && is_array($request->tags)) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['name' => $tagName],
                    ['slug' => Str::slug($tagName)]
                );
                $tag->incrementCount();
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        $post->load(['author', 'category', 'tags']);

        return response()->json([
            'message' => 'Post created successfully',
            'data' => $post
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'message' => 'Post not found'
            ], 404);
        }

        // Check if user is the author
        if (auth()->id() !== $post->author_id) {
            return response()->json([
                'message' => 'Unauthorized to update this post'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'content' => 'string',
            'summary' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'in:draft,published,archived',
            'meta_description' => 'nullable|string|max:160',
            'featured_image' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only([
            'title', 'content', 'summary', 'category_id', 
            'status', 'meta_description', 'featured_image'
        ]);

        // Update published_at when status changes to published
        if ($request->has('status') && $request->status === 'published' && !$post->published_at) {
            $updateData['published_at'] = now();
        }

        $post->update($updateData);

        // Handle tags
        if ($request->has('tags') && is_array($request->tags)) {
            // Decrement count for old tags
            foreach ($post->tags as $oldTag) {
                $oldTag->decrementCount();
            }

            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['name' => $tagName],
                    ['slug' => Str::slug($tagName)]
                );
                $tag->incrementCount();
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        $post->load(['author', 'category', 'tags']);

        return response()->json([
            'message' => 'Post updated successfully',
            'data' => $post
        ]);
    }

    public function destroy($id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'message' => 'Post not found'
            ], 404);
        }

        // Check if user is the author
        if (auth()->id() !== $post->author_id) {
            return response()->json([
                'message' => 'Unauthorized to delete this post'
            ], 403);
        }

        // Soft delete - change status to archived instead of actual deletion
        $post->update(['status' => 'archived']);

        // Decrement tag counts
        foreach ($post->tags as $tag) {
            $tag->decrementCount();
        }

        return response()->json([
            'message' => 'Post archived successfully'
        ]);
    }
}
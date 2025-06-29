<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('posts')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        $category->load(['posts.author', 'posts.tags']);
        $category->loadCount('posts');

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string|max:1000'
        ]);

        $slug = \Str::slug($request->name);
        
        // Ensure slug is unique
        $originalSlug = $slug;
        $count = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description
        ]);

        return response()->json([
            'success' => true,
            'data' => $category
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000'
        ]);

        $slug = \Str::slug($request->name);
        
        // Ensure slug is unique (excluding current category)
        $originalSlug = $slug;
        $count = 1;
        while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        $category->update([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description
        ]);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        // Check if category has posts
        if ($category->posts()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category that has posts'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
}
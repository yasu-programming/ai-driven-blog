<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Posts API routes
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
});

// AI API routes
Route::prefix('ai')->middleware('auth:sanctum')->group(function () {
    Route::post('/proofread', function () {
        return response()->json(['message' => 'AI proofread endpoint']);
    });
    Route::post('/generate-tags', function () {
        return response()->json(['message' => 'AI tag generation endpoint']);
    });
    Route::post('/summarize', function () {
        return response()->json(['message' => 'AI summarize endpoint']);
    });
    Route::post('/seo-optimize', function () {
        return response()->json(['message' => 'AI SEO optimize endpoint']);
    });
});

// Media API routes
Route::prefix('media')->middleware('auth:sanctum')->group(function () {
    Route::post('/upload', function () {
        return response()->json(['message' => 'Media upload endpoint']);
    });
    Route::get('/{id}', function ($id) {
        return response()->json(['message' => "Media $id endpoint"]);
    });
    Route::delete('/{id}', function ($id) {
        return response()->json(['message' => "Delete media $id endpoint"]);
    });
});

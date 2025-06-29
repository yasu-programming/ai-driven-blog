<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Posts API routes
Route::prefix('posts')->group(function () {
    Route::get('/', function () {
        return response()->json(['message' => 'Posts list endpoint']);
    });
    Route::get('/{id}', function ($id) {
        return response()->json(['message' => "Post $id details endpoint"]);
    });
    Route::post('/', function () {
        return response()->json(['message' => 'Create post endpoint']);
    })->middleware('auth:sanctum');
    Route::put('/{id}', function ($id) {
        return response()->json(['message' => "Update post $id endpoint"]);
    })->middleware('auth:sanctum');
    Route::delete('/{id}', function ($id) {
        return response()->json(['message' => "Delete post $id endpoint"]);
    })->middleware('auth:sanctum');
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

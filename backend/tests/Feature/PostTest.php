<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
    }

    public function test_can_list_published_posts()
    {
        // Create published and draft posts
        Post::factory()->count(3)->create(['status' => 'published']);
        Post::factory()->count(2)->create(['status' => 'draft']);

        $response = $this->getJson('/api/posts');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'data' => [
                            '*' => ['id', 'title', 'content', 'status', 'author', 'category', 'tags']
                        ],
                        'current_page',
                        'total'
                    ]
                ]);

        // Should only return published posts
        $posts = $response->json('data.data');
        $this->assertCount(3, $posts);
        foreach ($posts as $post) {
            $this->assertEquals('published', $post['status']);
        }
    }

    public function test_can_show_published_post()
    {
        $post = Post::factory()->create(['status' => 'published']);

        $response = $this->getJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => ['id', 'title', 'content', 'status', 'author', 'category', 'tags']
                ]);
    }

    public function test_cannot_show_draft_post_as_guest()
    {
        $post = Post::factory()->create(['status' => 'draft']);

        $response = $this->getJson("/api/posts/{$post->id}");

        $response->assertStatus(404);
    }

    public function test_author_can_show_own_draft_post()
    {
        $post = Post::factory()->create([
            'status' => 'draft',
            'author_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson("/api/posts/{$post->id}");

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_post()
    {
        $postData = [
            'title' => 'Test Post',
            'content' => 'This is a test post content.',
            'summary' => 'Test summary',
            'category_id' => $this->category->id,
            'status' => 'draft',
            'tags' => ['test', 'laravel']
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/posts', $postData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'data' => ['id', 'title', 'content', 'author_id', 'tags']
                ]);

        $this->assertDatabaseHas('posts', [
            'title' => 'Test Post',
            'author_id' => $this->user->id
        ]);

        // Check tags were created
        $this->assertDatabaseHas('tags', ['name' => 'test']);
        $this->assertDatabaseHas('tags', ['name' => 'laravel']);
    }

    public function test_guest_cannot_create_post()
    {
        $postData = [
            'title' => 'Test Post',
            'content' => 'This is a test post content.'
        ];

        $response = $this->postJson('/api/posts', $postData);

        $response->assertStatus(401);
    }

    public function test_author_can_update_own_post()
    {
        $post = Post::factory()->create(['author_id' => $this->user->id]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated content',
            'status' => 'published'
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/posts/{$post->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Post updated successfully'
                ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Updated Title',
            'status' => 'published'
        ]);
    }

    public function test_user_cannot_update_others_post()
    {
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['author_id' => $otherUser->id]);

        $updateData = ['title' => 'Hacked Title'];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/posts/{$post->id}", $updateData);

        $response->assertStatus(403);
    }

    public function test_author_can_delete_own_post()
    {
        $post = Post::factory()->create(['author_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Post archived successfully'
                ]);

        // Post should be archived, not deleted
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'status' => 'archived'
        ]);
    }

    public function test_user_cannot_delete_others_post()
    {
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['author_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(403);
    }

    public function test_post_creation_validation()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/posts', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['title', 'content']);
    }

    public function test_can_search_posts()
    {
        Post::factory()->create([
            'title' => 'Laravel Tutorial',
            'status' => 'published'
        ]);
        Post::factory()->create([
            'title' => 'React Guide',
            'status' => 'published'
        ]);

        $response = $this->getJson('/api/posts?search=Laravel');

        $response->assertStatus(200);
        $posts = $response->json('data.data');
        $this->assertCount(1, $posts);
        $this->assertStringContainsString('Laravel', $posts[0]['title']);
    }
}
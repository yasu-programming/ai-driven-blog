<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Technology',
                'slug' => 'technology',
                'description' => 'Articles about technology, programming, and software development'
            ],
            [
                'name' => 'AI & Machine Learning',
                'slug' => 'ai-machine-learning',
                'description' => 'Artificial Intelligence and Machine Learning related content'
            ],
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Frontend and backend web development topics'
            ],
            [
                'name' => 'Mobile Development',
                'slug' => 'mobile-development',
                'description' => 'iOS, Android, and cross-platform mobile development'
            ],
            [
                'name' => 'DevOps',
                'slug' => 'devops',
                'description' => 'DevOps, CI/CD, and infrastructure topics'
            ],
            [
                'name' => 'Design',
                'slug' => 'design',
                'description' => 'UI/UX design, graphic design, and design thinking'
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Business strategy, entrepreneurship, and industry insights'
            ],
            [
                'name' => 'Tutorials',
                'slug' => 'tutorials',
                'description' => 'Step-by-step guides and how-to articles'
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}

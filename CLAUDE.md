# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-driven blog system with comprehensive content management and AI-powered features. The project uses a Laravel backend with Next.js frontend architecture.

## Technology Stack

### Backend (Laravel)
- **Framework**: Laravel (PHP)
- **Database**: PostgreSQL
- **Authentication**: Laravel Sanctum (JWT)
- **Architecture**: RESTful API

### Frontend (Next.js)
- **Framework**: Next.js with TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: React Context/Zustand (to be determined)

## Project Structure

```
ai-driven-blog/
├── docs/                    # Project documentation
│   ├── blog-requirements.md # Comprehensive feature requirements
│   ├── development-issues.md # Issue management and milestones
│   └── project-board-setup.md # GitHub project board configuration
├── backend/                 # Laravel API (not yet created)
└── frontend/               # Next.js application (not yet created)
```

## Development Milestones

Based on `docs/development-issues.md`, the project follows a 4-phase development approach:

1. **Milestone 1**: Environment setup and infrastructure (Docker, Laravel, Next.js)
2. **Milestone 2**: Authentication and basic CRUD operations
3. **Milestone 3**: UI/UX implementation and content management
4. **Milestone 4**: Advanced features (search, SEO optimization)

## Key Features (from requirements)

### Core Blog Features
- Article CRUD with draft/publish states
- Category and tag management
- Media upload with image optimization
- Rich text editor with real-time saving

### AI-Powered Features
- Text proofreading (`POST /api/ai/proofread`)
- Auto-tag generation (`POST /api/ai/generate-tags`)
- Content summarization (`POST /api/ai/summarize`)
- SEO optimization (`POST /api/ai/seo-optimize`)

## API Design

Key API endpoints (from requirements):
- `GET/POST/PUT/DELETE /api/posts` - Article management
- `POST /api/media/upload` - File uploads
- `POST /api/ai/*` - AI feature endpoints

## Database Schema

Main entities:
- **posts**: id, title, content, summary, author_id, category_id, status, timestamps
- **categories**: id, name, slug, description, parent_id (hierarchical)
- **tags**: id, name, slug, count
- **post_tags**: Many-to-many relationship table

## Development Setup (Future)

When the technical implementation begins, expect to run:
- `composer install` and `php artisan serve` for Laravel backend
- `npm install` and `npm run dev` for Next.js frontend
- Docker containers for development environment consistency

## Issue Management

The project uses GitHub Issues with structured milestones and labels as defined in `docs/development-issues.md`. Issues are categorized by:
- **Priority**: high/medium/low
- **Type**: feature/bug/enhancement/docs/setup
- **Area**: backend/frontend/database/ui-ux/devops
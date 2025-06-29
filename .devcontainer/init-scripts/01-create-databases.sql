-- AI-Driven Blog Development Database Setup

-- Create databases
CREATE DATABASE ai_blog_dev;
CREATE DATABASE ai_blog_test;

-- Create user for the application
CREATE USER ai_blog_user WITH ENCRYPTED PASSWORD 'ai_blog_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ai_blog_dev TO ai_blog_user;
GRANT ALL PRIVILEGES ON DATABASE ai_blog_test TO ai_blog_user;

-- Connect to ai_blog_dev and create extensions
\c ai_blog_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Connect to ai_blog_test and create extensions
\c ai_blog_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant schema privileges
\c ai_blog_dev;
GRANT ALL ON SCHEMA public TO ai_blog_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_blog_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_blog_user;

\c ai_blog_test;
GRANT ALL ON SCHEMA public TO ai_blog_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_blog_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_blog_user;
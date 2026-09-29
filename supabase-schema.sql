-- ============================================================
-- SCIFILENS - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ============================================================
-- Run this complete script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- 1. Enable UUID Extension (Supabase includes this by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. PROFILES TABLE
-- ============================================================
-- Stores public user profile data linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Sci-Fi Enthusiast & Cosmic Explorer',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies:
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================
-- Automatically inserts a record into public.profiles whenever
-- a new user signs up via Email/Password OR Google OAuth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NULL
        )
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on every new user in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. MOVIE LIKES TABLE
-- ============================================================
-- Stores movies liked by authenticated users
CREATE TABLE IF NOT EXISTS public.movie_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id)
);

-- Performance index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_movie_likes_user ON public.movie_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_likes_movie ON public.movie_likes(movie_id);

-- Enable RLS on movie_likes
ALTER TABLE public.movie_likes ENABLE ROW LEVEL SECURITY;

-- Movie Likes Policies:
CREATE POLICY "Users can view own movie likes"
    ON public.movie_likes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add own movie likes"
    ON public.movie_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own movie likes"
    ON public.movie_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 5. CONCEPT LIKES TABLE
-- ============================================================
-- Stores science concepts liked by authenticated users
CREATE TABLE IF NOT EXISTS public.concept_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    concept_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_concept UNIQUE (user_id, concept_id)
);

-- Performance index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_concept_likes_user ON public.concept_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_concept_likes_concept ON public.concept_likes(concept_id);

-- Enable RLS on concept_likes
ALTER TABLE public.concept_likes ENABLE ROW LEVEL SECURITY;

-- Concept Likes Policies:
CREATE POLICY "Users can view own concept likes"
    ON public.concept_likes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add own concept likes"
    ON public.concept_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own concept likes"
    ON public.concept_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 6. QUIZ ATTEMPTS TABLE
-- ============================================================
-- Stores historical quiz and trivia scores for authenticated users
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL,
    quiz_name TEXT NOT NULL,
    score NUMERIC NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for ordering attempts by completion time
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_date ON public.quiz_attempts(user_id, completed_at DESC);

-- Enable RLS on quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz Attempts Policies:
CREATE POLICY "Users can view own quiz attempts"
    ON public.quiz_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
    ON public.quiz_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION (Avatars)
-- ============================================================
-- Create an 'avatars' public bucket in Storage if not present
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for avatars bucket:
-- Allow anyone to view avatar images
CREATE POLICY "Public avatar read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatar images into their folder/file
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

-- Allow users to update/replace their own avatar
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

-- ============================================================
-- 8. OPTIONAL FUTURE MOVIE & CONCEPT DATA TABLES
-- ============================================================
-- You can keep your JSON files working as they do now, and optionally
-- migrate to these database tables whenever you are ready:

CREATE TABLE IF NOT EXISTS public.movies (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    director TEXT,
    genre TEXT,
    poster TEXT,
    poster_url TEXT,
    backdrop TEXT,
    description TEXT,
    scientific_accuracy NUMERIC(3,1),
    runtime TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.concepts (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    icon TEXT,
    category TEXT,
    difficulty TEXT,
    confidence_label TEXT,
    description TEXT,
    formula TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Allow public read access to catalog
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read movies" ON public.movies FOR SELECT USING (true);

ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read concepts" ON public.concepts FOR SELECT USING (true);

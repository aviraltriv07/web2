# SciFiLens - Supabase Integration & Setup Guide

Welcome to the complete setup and deployment guide for the **SciFiLens** Supabase authentication, database, Row Level Security (RLS), and user personalization system.

---

## 📋 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Step 1: Create a Free Supabase Project](#step-1-create-a-free-supabase-project)
3. [Step 2: Obtain API Keys (URL & Anon Key)](#step-2-obtain-api-keys-url--anon-key)
4. [Step 3: Configure `js/supabase.js`](#step-3-configure-jssupabasejs)
5. [Step 4: Execute Database Schema & RLS SQL](#step-4-execute-database-schema--rls-sql)
6. [Step 5: Enable Email / Password Authentication](#step-5-enable-email--password-authentication)
7. [Step 6: Configure Google / Gmail OAuth Login](#step-6-configure-google--gmail-oauth-login)
8. [Step 7: Configure Supabase Storage (`avatars` Bucket)](#step-7-configure-supabase-storage-avatars-bucket)
9. [Step 8: End-to-End Testing Checklist](#step-8-end-to-end-testing-checklist)
10. [Security & Row Level Security (RLS) Verification](#security--row-level-security-rls-verification)
11. [Future Data Migration (JSON to PostgreSQL)](#future-data-migration-json-to-postgresql)

---

## 1. Overview & Architecture

SciFiLens uses Supabase to power:
- **Authentication**: Email/Password and Google OAuth login/signup.
- **PostgreSQL Database**:
  - `profiles`: User information (Full Name, Avatar URL, Email, Bio, Member Since).
  - `movie_likes`: Movies liked by the user (`user_id`, `movie_id`, `created_at`).
  - `concept_likes`: Science concepts liked by the user (`user_id`, `concept_id`, `created_at`).
  - `quiz_attempts`: Historical quiz scores for Movie Science Trivia and Scientist Archetype quizzes.
- **Row Level Security (RLS)**: Enforces strict data isolation so users can only view, update, and delete their own private profile, likes, and quiz records using `auth.uid()`.
- **Supabase Storage**: Public `avatars` bucket with authenticated upload rules for user profile pictures.

```
┌──────────────────────────────────────────────────────────┐
│                   SciFiLens Frontend                     │
│  (index.html, movies.html, concepts.html, quiz.html, etc)│
└──────────────┬────────────────────────────┬──────────────┘
               │                            │
      [Supabase Auth]              [Supabase Postgres DB & Storage]
  • Email/Password Signup       • profiles (User Metadata)
  • Google OAuth Sign-in        • movie_likes (UNIQUE per user/movie)
  • Session Persistence         • concept_likes (UNIQUE per user/concept)
  • Auth State Listener         • quiz_attempts (Historical scores)
                                • avatars Bucket (Profile Images)
                                • Protected by Row Level Security (RLS)
```

---

## Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **"New Project"**.
3. Select an organization (or create one).
4. Fill in the project details:
   - **Name**: `scifilens`
   - **Database Password**: Choose a strong password (save this securely).
   - **Region**: Choose a region closest to your users (e.g., *East US*, *Central EU*, or *South Asia*).
   - **Pricing Plan**: Free Tier ($0/month).
5. Click **"Create new project"** and wait 1–2 minutes for the database to provision.

---

## Step 2: Obtain API Keys (URL & Anon Key)

1. In your Supabase Project dashboard, navigate to **Project Settings** (gear icon at the bottom left) → **API**.
2. Locate the following two values under **Project API keys**:
   - **Project URL**: e.g., `https://abcdefghijklmno.supabase.co`
   - **`anon` / `public` Key**: e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> ⚠️ **CRITICAL SECURITY NOTE**: Never use the `service_role` (secret) key in frontend JavaScript. Only use the `anon` / `public` key. Row Level Security policies protect all user records against unauthorized access.

---

## Step 3: Configure `js/supabase.js`

Open `js/supabase.js` in your project and update lines 12–13 with your project credentials:

```javascript
// js/supabase.js
const DEFAULT_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; // Replace with Project URL
const DEFAULT_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';        // Replace with anon/public key
```

Save the file.

---

## Step 4: Execute Database Schema & RLS SQL

We have provided a complete, battle-tested SQL schema script in [`supabase-schema.sql`](file:///c:/Users/Admin/OneDrive/Desktop/web2/supabase-schema.sql).

1. In your Supabase Dashboard, click **SQL Editor** in the left sidebar.
2. Click **"+ New Query"**.
3. Open [`supabase-schema.sql`](file:///c:/Users/Admin/OneDrive/Desktop/web2/supabase-schema.sql), copy the entire content, and paste it into the SQL Editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. Verify that the output shows `Success. No rows returned` or lists created tables.

### What this SQL script creates:
- **`profiles` table**: Links to `auth.users(id)` with RLS policies allowing users to view and update only their own profile.
- **`handle_new_user()` trigger**: Automatically generates a user profile record in `public.profiles` upon signup or Google OAuth sign-in with name, email, and avatar picture.
- **`movie_likes` table**: With a `UNIQUE(user_id, movie_id)` constraint and full RLS policies (`SELECT`, `INSERT`, `DELETE` scoped to `auth.uid()`).
- **`concept_likes` table**: With a `UNIQUE(user_id, concept_id)` constraint and RLS policies.
- **`quiz_attempts` table**: Stores historical quiz records with scores, percentages, and timestamps with RLS policies.
- **`avatars` Storage bucket**: Configures public read access and authenticated upload/update access.

---

## Step 5: Enable Email / Password Authentication

1. In your Supabase Dashboard, go to **Authentication** → **Providers**.
2. Click **Email**.
3. Ensure **Enable Email provider** is switched **ON**.
4. *(Optional for local development / testing)*: If you do not want to wait for email confirmation links during development, disable **"Confirm email"** and click **Save**. In production, keep email confirmation enabled.

---

## Step 6: Configure Google / Gmail OAuth Login

To allow users to click **"Continue with Google"**:

### A. Create Google OAuth Credentials in Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **SciFiLens**.
3. Navigate to **APIs & Services** → **OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - **App name**: `SciFiLens`
   - **User support email**: Your email.
   - **Developer contact information**: Your email.
   - Click **Save and Continue** through Scopes and Test Users.
4. Navigate to **APIs & Services** → **Credentials**:
   - Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**.
   - **Application type**: Web application.
   - **Name**: `SciFiLens Web Client`.
   - **Authorized redirect URIs**: Add your Supabase callback URL:
     ```
     https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback
     ```
     *(You can find this exact redirect URL in Supabase Dashboard → Authentication → Providers → Google)*.
   - Click **Create**.
   - Copy the generated **Client ID** and **Client Secret**.

### B. Add Google Credentials to Supabase
1. In the Supabase Dashboard, go to **Authentication** → **Providers** → **Google**.
2. Turn **"Enable Google provider"** to **ON**.
3. Paste the **Client ID** from Google Cloud Console.
4. Paste the **Client Secret** from Google Cloud Console.
5. Click **Save**.

### C. Configure Supabase Redirect URLs
1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your website URL (e.g. `http://localhost:5500` or `https://yourdomain.com`).
3. Under **Redirect URLs**, add:
   - `http://localhost:5500/**`
   - `http://127.0.0.1:5500/**`
   - `http://localhost:3000/**`
   - Your production URL (if deployed).
4. Click **Save**.

---

## Step 7: Configure Supabase Storage (`avatars` Bucket)

The SQL script in Step 4 automatically creates the `avatars` bucket and policies. To verify:

1. In Supabase Dashboard, go to **Storage** in the left sidebar.
2. You should see a bucket named **`avatars`** with a **Public** badge.
3. If not already present, you can click **"New bucket"**, name it `avatars`, toggle **Public bucket** to **ON**, and save.

---

## Step 8: End-to-End Testing Checklist

### 1. Test Email/Password Signup
- Open `login.html` in your browser.
- Click the **Sign Up** tab.
- Enter your Full Name, Email, Password (e.g. `CosmicPass123!`), and Confirm Password.
- Click **Create Account**.
- You will be logged in and redirected to `profile.html` with your name and email displayed.

### 2. Test Navbar Dynamic Auth State
- Look at the top navigation bar:
  - When logged in, it shows **My SciFiLens** and **Logout**.
  - The profile icon shows your user avatar initial or photo.
- Click **Logout**:
  - You are logged out and the navbar switches to **Login**.

### 3. Test Movie Likes
- Go to `movies.html` or `index.html`.
- Click the **♡ Like** button on *Interstellar* (or any movie).
- The button instantly pops and turns into a glowing **♥ Liked**.
- Open `movie-detail.html?id=1` — the Like button reflects the liked state.
- Open `profile.html` → Click the **Liked Movies** tab.
- *Interstellar* appears under your saved favorites.
- Click **Liked** to unlike it — it updates immediately.

### 4. Test Concept Likes
- Go to `concepts.html` or `science.html`.
- Click the **♡ Like Concept** button on *Gravity* or *Relativity*.
- The button turns to **♥ Liked**.
- Open `profile.html` → Click **Liked Concepts** tab.
- *Gravity* is saved in your personalized list.

### 5. Test Quiz Score Storage
- Go to `quiz.html`.
- Take the **Movie Science IQ Trivia** quiz.
- Complete the 10 questions.
- On the results screen, you will see a green confirmation badge:
  `✓ Quiz score automatically recorded in your SciFiLens profile!`
- Go to `profile.html` → Click **My Quiz Scores** tab.
  - Your score (e.g., 8/10, 80%) with timestamp is permanently recorded.
- Take the **Which Scientist Are You?** archetype quiz.
  - Your archetype result is also automatically recorded in your history!

### 6. Test Guest Users
- Open an Incognito/Private window (logged out).
- Go to `movies.html` and click **♡ Like**:
  - A friendly toast notification appears: *"Please log in to save movies to your SciFiLens profile."* with a direct **Log In** button.
- Take a quiz as a guest:
  - Your score is calculated and displayed normally.
  - A banner encourages you to create an account or sign in to save your score.

---

## Security & Row Level Security (RLS) Verification

SciFiLens implements strict PostgreSQL Row Level Security (RLS) policies:

| Table | Policy Name | Permitted Operation | Filter Rule |
|---|---|---|---|
| `profiles` | Users can view own profile | `SELECT` | `auth.uid() = id` |
| `profiles` | Users can update own profile | `UPDATE` | `auth.uid() = id` |
| `movie_likes` | Users can view own movie likes | `SELECT` | `auth.uid() = user_id` |
| `movie_likes` | Users can add own movie likes | `INSERT` | `auth.uid() = user_id` |
| `movie_likes` | Users can delete own movie likes | `DELETE` | `auth.uid() = user_id` |
| `concept_likes` | Users can view own concept likes | `SELECT` | `auth.uid() = user_id` |
| `concept_likes` | Users can add own concept likes | `INSERT` | `auth.uid() = user_id` |
| `concept_likes` | Users can delete own concept likes | `DELETE` | `auth.uid() = user_id` |
| `quiz_attempts` | Users can view own quiz attempts | `SELECT` | `auth.uid() = user_id` |
| `quiz_attempts` | Users can insert own quiz attempts | `INSERT` | `auth.uid() = user_id` |

### Testing RLS in SQL Editor:
You can verify RLS isolation directly in the Supabase SQL editor by querying with a simulated user:
```sql
-- Simulate authenticated user session
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'USER_UUID_HERE';

-- This query only returns the authenticated user's records:
SELECT * FROM public.movie_likes;
SELECT * FROM public.quiz_attempts;
```

---

## Future Data Migration (JSON to PostgreSQL)

SciFiLens currently serves movie and concept catalogs from `data/movies.json` and `data/science-concepts.json` for lightning-fast frontend performance.

When you wish to migrate the catalog entirely into Supabase PostgreSQL tables:

1. The tables `public.movies` and `public.concepts` are already included in [`supabase-schema.sql`](file:///c:/Users/Admin/OneDrive/Desktop/web2/supabase-schema.sql).
2. You can import your JSON objects into PostgreSQL using the Supabase Table Editor's CSV/JSON import tool or a Node.js seed script:
   ```javascript
   // Migration snippet (run with service role key in backend/Node):
   const moviesData = require('./data/movies.json').movies;
   await supabase.from('movies').upsert(moviesData);
   ```
3. Update `fetchJSON('data/movies.json')` in `js/main.js` to:
   ```javascript
   const { data: movies } = await supabase.from('movies').select('*');
   ```

---

## 🚀 Congratulations!
Your SciFiLens website is now fully equipped with user accounts, Google OAuth, movie/concept liking, persistent quiz history, and security.

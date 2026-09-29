/**
 * SciFiLens - Supabase Client & API Module
 * 
 * Centralized Supabase integration for Authentication, PostgreSQL Database,
 * Row Level Security (RLS), and Storage.
 */

// ============================================================
// SUPABASE CONFIGURATION
// Replace these placeholders with your actual Supabase Project details.
// (You can also configure them via the in-app setup banner or localStorage)
// ============================================================
const DEFAULT_SUPABASE_URL = 'https://uonzseldwyxxpvmfrhja.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_5_V3yIHYy4H3eULxHjzZ5g_m_iE9BfI';

// Support localStorage override for easy live testing without editing files
const SUPABASE_URL = localStorage.getItem('scifilens_supabase_url') || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = localStorage.getItem('scifilens_supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY;

// Check if credentials have been replaced with real credentials
function isSupabaseConfigured() {
    return SUPABASE_URL && 
           !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') &&
           SUPABASE_ANON_KEY && 
           !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');
}

// Global Supabase Client instance
let _supabaseClient = null;

function getSupabase() {
    if (_supabaseClient) return _supabaseClient;

    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
            _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            return _supabaseClient;
        } catch (e) {
            console.error('Error creating Supabase client:', e);
            return null;
        }
    } else {
        console.warn('Supabase JS library not loaded. Ensure CDN script is included.');
        return null;
    }
}

// Initialize client immediately if library is ready


// ============================================================
// AUTHENTICATION APIs
// ============================================================

/**
 * Sign up a new user with Email, Password, and Full Name
 */
async function authSignUp(fullName, email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not initialized');

    const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
            data: {
                full_name: fullName.trim(),
                name: fullName.trim()
            }
        }
    });

    if (error) throw error;

    // In case trigger didn't fire (or immediate profile creation needed)
    if (data.user) {
        try {
            await upsertUserProfile(data.user.id, {
                full_name: fullName.trim(),
                email: email.trim()
            });
        } catch (profileErr) {
            console.warn('Profile fallback creation notice:', profileErr.message);
        }
    }

    return data;
}

/**
 * Log in an existing user with Email and Password
 */
async function authSignIn(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not initialized');

    const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
    });

    if (error) throw error;
    return data;
}

/**
 * Continue with Google OAuth Login
 */
async function authSignInWithGoogle() {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not initialized');

    // Dynamically calculate redirect URL back to current origin + index.html
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    let redirectTo = origin + pathname;
    if (pathname.endsWith('login.html')) {
        redirectTo = origin + pathname.replace('login.html', 'index.html');
    }

    const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent'
            }
        }
    });

    if (error) throw error;
    return data;
}

/**
 * Log out the currently authenticated user
 */
async function authSignOut() {
    const client = getSupabase();
    if (!client) return;

    // Clear any local caches
    localStorage.removeItem('scifilens_cached_movie_likes');
    localStorage.removeItem('scifilens_cached_concept_likes');

    const { error } = await client.auth.signOut();
    if (error) throw error;
}

/**
 * Send password reset email
 */
async function authResetPassword(email) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase is not initialized');

    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const redirectTo = origin + pathname.replace(/[^\/]+$/, 'login.html');

    const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectTo
    });

    if (error) throw error;
    return data;
}

/**
 * Get current authenticated user session
 */
async function getCurrentUser() {
    const client = getSupabase();
    if (!client) return null;

    try {
        const { data: { user }, error } = await client.auth.getUser();
        if (error || !user) return null;
        return user;
    } catch (e) {
        return null;
    }
}

// ============================================================
// USER PROFILE APIs
// ============================================================

/**
 * Fetch public user profile from 'profiles' table
 */
async function getUserProfile(userId) {
    const client = getSupabase();
    if (!client || !userId) return null;

    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.warn('Error fetching user profile:', error.message);
        return null;
    }
    return data;
}

/**
 * Create or update user profile
 */
async function upsertUserProfile(userId, updates) {
    const client = getSupabase();
    if (!client || !userId) return null;

    const payload = {
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await client
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// MOVIE LIKES APIs
// ============================================================

/**
 * Fetch all movie IDs liked by user
 */
async function fetchUserMovieLikes(userId) {
    const client = getSupabase();
    if (!client || !userId) return [];

    const { data, error } = await client
        .from('movie_likes')
        .select('movie_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching movie likes:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Toggle movie like state in Supabase
 * @returns {Promise<{liked: boolean}>}
 */
async function toggleMovieLikeDb(userId, movieId) {
    const client = getSupabase();
    if (!client || !userId) throw new Error('User must be logged in to like movies');

    const mIdStr = String(movieId);

    // Check if like currently exists
    const { data: existing, error: checkErr } = await client
        .from('movie_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', mIdStr)
        .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
        // Remove like
        const { error: delErr } = await client
            .from('movie_likes')
            .delete()
            .eq('id', existing.id);

        if (delErr) throw delErr;
        return { liked: false };
    } else {
        // Add like
        const { error: insErr } = await client
            .from('movie_likes')
            .insert({
                user_id: userId,
                movie_id: mIdStr
            });

        if (insErr) throw insErr;
        return { liked: true };
    }
}

// ============================================================
// CONCEPT LIKES APIs
// ============================================================

/**
 * Fetch all concept IDs liked by user
 */
async function fetchUserConceptLikes(userId) {
    const client = getSupabase();
    if (!client || !userId) return [];

    const { data, error } = await client
        .from('concept_likes')
        .select('concept_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching concept likes:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Toggle concept like state in Supabase
 * @returns {Promise<{liked: boolean}>}
 */
async function toggleConceptLikeDb(userId, conceptId) {
    const client = getSupabase();
    if (!client || !userId) throw new Error('User must be logged in to like concepts');

    const cIdStr = String(conceptId);

    // Check if like currently exists
    const { data: existing, error: checkErr } = await client
        .from('concept_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('concept_id', cIdStr)
        .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
        // Remove like
        const { error: delErr } = await client
            .from('concept_likes')
            .delete()
            .eq('id', existing.id);

        if (delErr) throw delErr;
        return { liked: false };
    } else {
        // Add like
        const { error: insErr } = await client
            .from('concept_likes')
            .insert({
                user_id: userId,
                concept_id: cIdStr
            });

        if (insErr) throw insErr;
        return { liked: true };
    }
}

// ============================================================
// QUIZ ATTEMPTS APIs
// ============================================================

/**
 * Record a completed quiz attempt for the user
 */
async function recordQuizAttempt({ quizId, quizName, score, totalQuestions, percentage }) {
    const client = getSupabase();
    if (!client) return null;

    const user = await getCurrentUser();
    if (!user) return null; // Guest users not stored in DB

    const { data, error } = await client
        .from('quiz_attempts')
        .insert({
            user_id: user.id,
            quiz_id: String(quizId || 'quiz'),
            quiz_name: quizName || 'Science Quiz',
            score: Number(score) || 0,
            total_questions: Number(totalQuestions) || 10,
            percentage: Number(percentage) || 0,
            completed_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error recording quiz attempt in Supabase:', error.message);
        throw error;
    }

    return data;
}

/**
 * Fetch all quiz attempts for a user
 */
async function fetchUserQuizAttempts(userId) {
    const client = getSupabase();
    if (!client || !userId) return [];

    const { data, error } = await client
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

    if (error) {
        console.error('Error fetching quiz attempts:', error.message);
        return [];
    }
    return data || [];
}

// ============================================================
// SUPABASE STORAGE (Avatars)
// ============================================================

/**
 * Upload avatar image to Supabase Storage 'avatars' bucket
 */
async function uploadUserAvatar(userId, file) {
    const client = getSupabase();
    if (!client || !userId) throw new Error('User must be logged in to upload avatar');

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await client.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
            contentType: file.type
        });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = client.storage
        .from('avatars')
        .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    await upsertUserProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
}

// ============================================================
// EXPORTS & WINDOW ATTACHMENT
// ============================================================
window.SciFiLensSupabase = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    isSupabaseConfigured,
    getSupabase,
    // Auth
    authSignUp,
    authSignIn,
    authSignInWithGoogle,
    authSignOut,
    authResetPassword,
    getCurrentUser,
    // Profile
    getUserProfile,
    upsertUserProfile,
    // Likes
    fetchUserMovieLikes,
    toggleMovieLikeDb,
    fetchUserConceptLikes,
    toggleConceptLikeDb,
    // Quizzes
    recordQuizAttempt,
    fetchUserQuizAttempts,
    // Storage
    uploadUserAvatar
};

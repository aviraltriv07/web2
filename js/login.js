/**
 * SciFiLens - Login Page Logic
 * Handles tab switching, form submissions, and Supabase auth for login.html
 */

'use strict';

// ============================================================
// TAB SWITCHING
// ============================================================

/**
 * Switch between Login, Signup, and Forgot Password tabs.
 * @param {'login'|'signup'|'forgot'} tab
 */
function switchAuthTab(tab) {
    // Update tab buttons
    const tabLogin  = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    if (tabLogin)  tabLogin.classList.toggle('active',  tab === 'login');
    if (tabSignup) tabSignup.classList.toggle('active', tab === 'signup');

    // Show/hide forms
    const loginForm  = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');

    if (loginForm)  loginForm.style.display  = tab === 'login'  ? 'flex' : 'none';
    if (signupForm) signupForm.style.display  = tab === 'signup' ? 'flex' : 'none';
    if (forgotForm) forgotForm.style.display  = tab === 'forgot' ? 'flex' : 'none';

    // Update heading & subtitle
    const titles = {
        login:  { title: 'Welcome Back',    subtitle: 'Sign in to access your personal science dashboard, saved movies, and quiz history.' },
        signup: { title: 'Create Account',  subtitle: 'Join SciFiLens to save liked movies, bookmark science concepts, and track quiz scores.' },
        forgot: { title: 'Reset Password',  subtitle: "Enter your email and we'll send you a link to reset your password." }
    };
    const t = titles[tab] || titles.login;
    const authTitle    = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    if (authTitle)    authTitle.textContent    = t.title;
    if (authSubtitle) authSubtitle.textContent = t.subtitle;

    clearAuthAlert();
}

// ============================================================
// ALERT HELPERS
// ============================================================

function showAuthAlert(message, type) {
    type = type || 'error';
    var alert = document.getElementById('authAlert');
    if (!alert) return;
    alert.textContent = message;
    alert.className = 'auth-alert ' + type;
}

function clearAuthAlert() {
    var alert = document.getElementById('authAlert');
    if (!alert) return;
    alert.className = 'auth-alert';
    alert.textContent = '';
}

// ============================================================
// SET BUTTON LOADING STATE
// ============================================================

function setButtonLoading(btnId, loading, defaultText) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    var span = btn.querySelector('span');
    if (span) span.textContent = loading ? 'Please wait\u2026' : defaultText;
}

// ============================================================
// LOGIN FORM
// ============================================================

async function handleLoginSubmit(event) {
    event.preventDefault();
    clearAuthAlert();

    var email    = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value.trim() : '';
    var password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';

    if (!email || !password) {
        showAuthAlert('Please fill in all fields.', 'error');
        return;
    }

    setButtonLoading('loginSubmitBtn', true, 'Log In');

    try {
        await authSignIn(email, password);
        showAuthAlert('Logged in successfully! Redirecting\u2026', 'success');
        setTimeout(function() { window.location.href = 'index.html'; }, 1200);
    } catch (err) {
        showAuthAlert(friendlyAuthError(err.message), 'error');
    } finally {
        setButtonLoading('loginSubmitBtn', false, 'Log In');
    }
}

// ============================================================
// SIGNUP FORM
// ============================================================

async function handleSignupSubmit(event) {
    event.preventDefault();
    clearAuthAlert();

    var name     = document.getElementById('signupName') ? document.getElementById('signupName').value.trim() : '';
    var email    = document.getElementById('signupEmail') ? document.getElementById('signupEmail').value.trim() : '';
    var password = document.getElementById('signupPassword') ? document.getElementById('signupPassword').value : '';
    var confirm  = document.getElementById('signupConfirmPassword') ? document.getElementById('signupConfirmPassword').value : '';

    if (!name || !email || !password || !confirm) {
        showAuthAlert('Please fill in all fields.', 'error');
        return;
    }

    if (password !== confirm) {
        showAuthAlert('Passwords do not match. Please try again.', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    setButtonLoading('signupSubmitBtn', true, 'Create Account');

    try {
        var data = await authSignUp(name, email, password);

        // Supabase sometimes requires email verification
        if (data.user && !data.session) {
            showAuthAlert('Account created! Please check your email to confirm your account, then log in.', 'success');
        } else {
            showAuthAlert('Account created! Redirecting\u2026', 'success');
            setTimeout(function() { window.location.href = 'index.html'; }, 1200);
        }
    } catch (err) {
        showAuthAlert(friendlyAuthError(err.message), 'error');
    } finally {
        setButtonLoading('signupSubmitBtn', false, 'Create Account');
    }
}

// ============================================================
// FORGOT PASSWORD
// ============================================================

function openForgotPassword(event) {
    if (event) event.preventDefault();
    switchAuthTab('forgot');
}

async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    clearAuthAlert();

    var email = document.getElementById('forgotEmail') ? document.getElementById('forgotEmail').value.trim() : '';
    if (!email) {
        showAuthAlert('Please enter your email address.', 'error');
        return;
    }

    setButtonLoading('forgotSubmitBtn', true, 'Send Password Reset Link');

    try {
        await authResetPassword(email);
        showAuthAlert('Password reset email sent! Check your inbox (and spam folder).', 'success');
    } catch (err) {
        showAuthAlert(friendlyAuthError(err.message), 'error');
    } finally {
        setButtonLoading('forgotSubmitBtn', false, 'Send Password Reset Link');
    }
}

// ============================================================
// GOOGLE OAUTH
// ============================================================

async function handleGoogleOAuth() {
    clearAuthAlert();
    try {
        await authSignInWithGoogle();
        // OAuth redirect happens automatically
    } catch (err) {
        showAuthAlert(friendlyAuthError(err.message), 'error');
    }
}

// ============================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================

function togglePasswordVisibility(inputId, button) {
    var input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '\uD83D\uDE48'; // monkey-eyes-closed
        button.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        button.textContent = '\uD83D\uDC41\uFE0F'; // eye
        button.setAttribute('aria-label', 'Show password');
    }
}

// ============================================================
// FRIENDLY ERROR MESSAGES
// ============================================================

function friendlyAuthError(raw) {
    raw = raw || '';
    var msg = raw.toLowerCase();
    if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
        return 'Incorrect email or password. Please try again.';
    }
    if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
        return 'Please confirm your email address before logging in. Check your inbox.';
    }
    if (msg.includes('user already registered') || msg.includes('already been registered')) {
        return 'An account with this email already exists. Try logging in instead.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
        return 'Network error. Please check your connection and try again.';
    }
    if (msg.includes('supabase is not initialized') || msg.includes('not initialized')) {
        return 'Authentication service is not configured. Please check the Supabase setup.';
    }
    return raw || 'Something went wrong. Please try again.';
}

// ============================================================
// PAGE INIT
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Show Supabase config notice if credentials not set
    var notice = document.getElementById('configNotice');
    if (notice) {
        var configured = (typeof isSupabaseConfigured === 'function') ? isSupabaseConfigured() : false;
        notice.style.display = configured ? 'none' : 'block';
    }

    // Redirect already-logged-in users to home
    try {
        var user = await getCurrentUser();
        if (user) {
            showAuthAlert('You are already logged in. Redirecting\u2026', 'success');
            setTimeout(function() { window.location.href = 'index.html'; }, 1000);
        }
    } catch (e) {
        // Not logged in - show the login page normally
    }
});

/**
 * SciFiLens - Authentication Page Controller
 * Handles user login, registration, password recovery, and Google OAuth
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Check if Supabase keys have been configured
    if (window.SciFiLensSupabase && !window.SciFiLensSupabase.isSupabaseConfigured()) {
        const notice = document.getElementById('configNotice');
        if (notice) notice.style.display = 'block';
    }

    // Check if user is already logged in
    if (window.SciFiLensSupabase) {
        try {
            const user = await window.SciFiLensSupabase.getCurrentUser();
            if (user) {
                // If user is already logged in, show alert and offer redirect
                showAuthAlert(`You are already signed in as ${user.email}. Redirecting to your SciFiLens profile...`, 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1200);
            }
        } catch (e) {}
    }

    // Check URL parameters (e.g. ?mode=signup or ?mode=forgot)
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'signup') {
        switchAuthTab('signup');
    } else if (mode === 'forgot') {
        openForgotPassword();
    }
});

/**
 * Switch between Login and Signup tabs
 */
function switchAuthTab(mode) {
    clearAuthAlert();
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const tabsContainer = document.querySelector('.auth-tabs');

    if (tabsContainer) tabsContainer.style.display = 'flex';

    if (mode === 'signup') {
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'flex';
        if (forgotForm) forgotForm.style.display = 'none';

        if (tabLogin) tabLogin.classList.remove('active');
        if (tabSignup) tabSignup.classList.add('active');

        if (authTitle) authTitle.textContent = 'Create SciFiLens Account';
        if (authSubtitle) authSubtitle.textContent = 'Join to save your favorite movies, explore deep physics, and log your quiz progress.';
    } else {
        if (loginForm) loginForm.style.display = 'flex';
        if (signupForm) signupForm.style.display = 'none';
        if (forgotForm) forgotForm.style.display = 'none';

        if (tabLogin) tabLogin.classList.add('active');
        if (tabSignup) tabSignup.classList.remove('active');

        if (authTitle) authTitle.textContent = 'Welcome Back';
        if (authSubtitle) authSubtitle.textContent = 'Sign in to access your personal science dashboard, saved movies, and quiz history.';
    }
}

/**
 * Open Forgot Password View
 */
function openForgotPassword(event) {
    if (event) event.preventDefault();
    clearAuthAlert();

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabsContainer = document.querySelector('.auth-tabs');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'flex';
    if (tabsContainer) tabsContainer.style.display = 'none';

    if (authTitle) authTitle.textContent = 'Reset Password';
    if (authSubtitle) authSubtitle.textContent = 'Enter your registered email address and we will send you a secure password reset link.';
}

/**
 * Toggle Password Visibility
 */
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

/**
 * Handle Login Form Submit
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    clearAuthAlert();

    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const submitBtn = document.getElementById('loginSubmitBtn');

    if (!email || !password) {
        showAuthAlert('Please fill in all required fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAuthAlert('Please provide a valid email address.', 'error');
        return;
    }

    setButtonLoading(submitBtn, true, 'Signing In...');

    try {
        if (!window.SciFiLensSupabase) {
            throw new Error('Supabase client is not loaded. Please check your network connection.');
        }

        const data = await window.SciFiLensSupabase.authSignIn(email, password);
        showAuthAlert('Authentication successful! Welcome back to SciFiLens.', 'success');

        if (typeof showToast === 'function') {
            showToast(`Welcome back, ${data.user.email}!`, 'success');
        }

        // Determine redirect target
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'profile.html';

        setTimeout(() => {
            window.location.href = redirect;
        }, 800);
    } catch (err) {
        console.error('Login error:', err);
        let errorMsg = err.message || 'Unable to log you in. Please check your email and password.';
        if (errorMsg.toLowerCase().includes('invalid login credentials')) {
            errorMsg = 'Invalid email or password. Please verify your credentials or create a new account.';
        } else if (errorMsg.toLowerCase().includes('email not confirmed')) {
            errorMsg = 'Please verify your email address before logging in (or disable email confirmation in Supabase Dashboard -> Auth -> Providers -> Email).';
        }
        showAuthAlert(errorMsg, 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Log In');
    }
}

/**
 * Handle Sign Up Form Submit
 */
async function handleSignupSubmit(event) {
    event.preventDefault();
    clearAuthAlert();

    const fullName = document.getElementById('signupName')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    const submitBtn = document.getElementById('signupSubmitBtn');

    if (!fullName || !email || !password || !confirmPassword) {
        showAuthAlert('Please fill in all required fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAuthAlert('Please provide a valid email address.', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAuthAlert('Passwords do not match. Please ensure both passwords are identical.', 'error');
        return;
    }

    setButtonLoading(submitBtn, true, 'Creating Account...');

    try {
        if (!window.SciFiLensSupabase) {
            throw new Error('Supabase client is not loaded. Please check your network connection.');
        }

        const data = await window.SciFiLensSupabase.authSignUp(fullName, email, password);

        // Check if email confirmation is required by Supabase project
        if (data.session) {
            showAuthAlert('Account created successfully! Preparing your profile...', 'success');
            if (typeof showToast === 'function') {
                showToast(`Welcome to SciFiLens, ${fullName}!`, 'success');
            }
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            showAuthAlert('Account registered! If email confirmation is enabled in your Supabase project, check your inbox to confirm your account, then log in.', 'success');
            setTimeout(() => {
                switchAuthTab('login');
            }, 3000);
        }
    } catch (err) {
        console.error('Sign up error:', err);
        let errorMsg = err.message || 'Unable to create your account. Please try again.';
        if (errorMsg.toLowerCase().includes('already registered')) {
            errorMsg = 'An account with this email address already exists. Please log in instead.';
        }
        showAuthAlert(errorMsg, 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Create Account');
    }
}

/**
 * Handle Forgot Password Submit
 */
async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    clearAuthAlert();

    const email = document.getElementById('forgotEmail')?.value.trim();
    const submitBtn = document.getElementById('forgotSubmitBtn');

    if (!email || !isValidEmail(email)) {
        showAuthAlert('Please provide a valid registered email address.', 'error');
        return;
    }

    setButtonLoading(submitBtn, true, 'Sending Link...');

    try {
        if (!window.SciFiLensSupabase) {
            throw new Error('Supabase client is not loaded.');
        }

        await window.SciFiLensSupabase.authResetPassword(email);
        showAuthAlert(`Password reset link sent to ${email}! Please check your inbox and follow the instructions.`, 'success');
    } catch (err) {
        console.error('Password reset error:', err);
        showAuthAlert(err.message || 'Unable to send password reset link. Please verify the email address.', 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Send Password Reset Link');
    }
}

/**
 * Handle Google OAuth Sign In
 */
async function handleGoogleOAuth() {
    clearAuthAlert();
    try {
        if (!window.SciFiLensSupabase) {
            throw new Error('Supabase client is not loaded.');
        }

        showAuthAlert('Connecting to Google Authentication...', 'info');
        await window.SciFiLensSupabase.authSignInWithGoogle();
    } catch (err) {
        console.error('Google OAuth error:', err);
        showAuthAlert(err.message || 'Unable to authenticate with Google. Ensure Google provider is configured in Supabase.', 'error');
    }
}

/**
 * Utilities
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAuthAlert(message, type) {
    const alertEl = document.getElementById('authAlert');
    if (!alertEl) return;

    alertEl.className = `auth-alert ${type}`;
    alertEl.textContent = message;
    alertEl.style.display = 'block';
}

function clearAuthAlert() {
    const alertEl = document.getElementById('authAlert');
    if (alertEl) {
        alertEl.style.display = 'none';
        alertEl.textContent = '';
    }
}

function setButtonLoading(btn, isLoading, text) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerHTML = isLoading ? `
        <span class="spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></span>
        <span>${text}</span>
    ` : `<span>${text}</span>`;
}

// Attach to window
window.switchAuthTab = switchAuthTab;
window.openForgotPassword = openForgotPassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLoginSubmit = handleLoginSubmit;
window.handleSignupSubmit = handleSignupSubmit;
window.handleForgotPasswordSubmit = handleForgotPasswordSubmit;
window.handleGoogleOAuth = handleGoogleOAuth;

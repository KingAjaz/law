# Authentication Flow Review

This document provides a comprehensive review of all authentication flows in LegalEase.

## Authentication Methods

LegalEase supports the following authentication methods:

1. **Email/Password** - Traditional email and password authentication
2. **Magic Link (OTP)** - Passwordless authentication via email
3. **OAuth Provider** - Google (configured in Supabase)

## Authentication Flows

### 1. User Signup (Email/Password)

**Route:** `/signup`

**Flow:**
1. User enters email, password, full name
2. Form validation (email format, password strength)
3. Signup request sent to Supabase Auth
4. Supabase creates user in `auth.users` table
5. Trigger automatically creates profile in `profiles` table
6. Email confirmation email sent (if enabled in Supabase)
7. User redirected to email verification page or dashboard

**Files:**
- `app/signup/page.tsx` - Signup UI
- `lib/auth.ts` - `signUpWithEmail()` function
- Supabase trigger: `handle_new_user()` - Creates profile on signup

**Key Features:**
- ✅ Email format validation
- ✅ Password validation
- ✅ Full name collection
- ✅ Automatic profile creation via trigger
- ✅ Email confirmation (if enabled)

**Test Checklist:**
- [ ] Sign up with valid email and password
- [ ] Verify password requirements (minimum length, complexity)
- [ ] Test duplicate email handling (should show error)
- [ ] Verify profile is created automatically
- [ ] Test email confirmation flow (if enabled)
- [ ] Verify user is redirected appropriately after signup

**Common Issues:**
- Email confirmation might be disabled in Supabase (users can login immediately)
- Profile creation depends on trigger function `handle_new_user()`
- OAuth signup also creates profile via same trigger

### 2. User Login (Email/Password)

**Route:** `/login`

**Flow:**
1. User enters email and password
2. Login request sent to Supabase Auth
3. Supabase validates credentials
4. Session created and stored
5. User redirected to dashboard (or redirect URL if specified)

**Files:**
- `app/login/page.tsx` - Login UI
- `lib/auth.ts` - `signInWithEmail()` function

**Key Features:**
- ✅ Email/password authentication
- ✅ Session management (handled by Supabase)
- ✅ Redirect to dashboard or specified redirect URL
- ✅ Error handling for invalid credentials

**Test Checklist:**
- [ ] Login with valid credentials
- [ ] Test invalid email (should show error)
- [ ] Test invalid password (should show error)
- [ ] Verify session is created and persisted
- [ ] Test redirect to dashboard after login
- [ ] Test redirect to specified URL (redirect query param)
- [ ] Verify user can access protected routes after login

### 3. Magic Link Login (Passwordless)

**Route:** `/login`

**Flow:**
1. User enters email address
2. Magic link request sent to Supabase Auth
3. Supabase sends email with magic link
4. User clicks link in email
5. Link contains token that authenticates user
6. User is redirected to callback URL
7. Session created automatically
8. User redirected to dashboard

**Files:**
- `app/login/page.tsx` - Magic link UI (toggle between password/magic link)
- `lib/auth.ts` - `signInWithMagicLink()` function
- `app/auth/callback/route.ts` - Handles magic link callback

**Key Features:**
- ✅ Passwordless authentication
- ✅ Email-based authentication link
- ✅ Automatic session creation on link click
- ✅ Secure token-based authentication

**Test Checklist:**
- [ ] Request magic link with valid email
- [ ] Verify magic link email is sent
- [ ] Click magic link in email
- [ ] Verify user is authenticated automatically
- [ ] Test magic link expiration (if applicable)
- [ ] Test invalid/expired magic link

### 4. OAuth Login (Google)

**Route:** `/login` (OAuth button)

**Flow:**
1. User clicks Google OAuth button
2. Redirected to Google's consent screen
3. User authorizes application
4. Google redirects back to `/auth/callback`
5. Callback route exchanges code for session
6. Supabase creates/updates user in `auth.users`
7. Profile created/updated via trigger
8. User redirected to dashboard

**Files:**
- `app/login/page.tsx` - OAuth login button
- `lib/auth.ts` - `signInWithOAuth()` function
- `app/auth/callback/route.ts` - OAuth callback handler

**Key Features:**
- ✅ Google OAuth authentication
- ✅ Automatic user creation on first OAuth login
- ✅ Profile creation via trigger (extracts name from OAuth metadata)
- ✅ Session management

**Test Checklist:**
- [ ] Test Google OAuth login (if configured)
- [ ] Verify new OAuth user gets profile created
- [ ] Verify existing OAuth user session works
- [ ] Test OAuth callback handling
- [ ] Verify redirect to dashboard after OAuth login

**Configuration Required:**
- Google OAuth must be configured in Supabase Dashboard
- Google OAuth app credentials (Client ID, Secret) must be set
- Redirect URLs must be configured in Google OAuth app

### 5. Password Reset

**Route:** `/reset-password` (request) → `/auth/reset-password-confirm` (confirm)

**Flow:**
1. User requests password reset on `/reset-password` page
2. User enters email address
3. Supabase sends password reset email
4. User clicks reset link in email
5. Link contains token and redirects to `/auth/reset-password-confirm`
6. User enters new password
7. Password is reset in Supabase
8. User is redirected to login page

**Files:**
- `app/reset-password/page.tsx` - Password reset request page
- `app/auth/reset-password-confirm/page.tsx` - Password reset confirmation page
- `lib/auth.ts` - `resetPassword()` and `updatePassword()` functions

**Key Features:**
- ✅ Secure password reset via email
- ✅ Token-based password reset (secure)
- ✅ Password reset confirmation page
- ✅ Redirect to login after successful reset

**Test Checklist:**
- [ ] Request password reset with valid email
- [ ] Verify reset email is sent
- [ ] Click reset link in email
- [ ] Verify redirect to password reset confirmation page
- [ ] Enter new password and confirm
- [ ] Verify password is updated
- [ ] Test login with new password
- [ ] Test reset token expiration (if applicable)
- [ ] Test invalid/expired reset token

### 6. Email Verification

**Route:** `/auth/verify-email`

**Flow:**
1. User receives verification email after signup (if enabled)
2. User clicks verification link in email
3. Link redirects to `/auth/verify-email` with token
4. Token is verified with Supabase
5. Email is marked as verified
6. User is redirected to dashboard or login

**Files:**
- `app/auth/verify-email/page.tsx` - Email verification page
- `app/auth/callback/route.ts` - May handle email verification callbacks

**Key Features:**
- ✅ Email verification via secure token
- ✅ Automatic verification status update
- ✅ User feedback on verification status

**Test Checklist:**
- [ ] Sign up new user
- [ ] Verify verification email is sent (if enabled)
- [ ] Click verification link
- [ ] Verify email is marked as verified in Supabase
- [ ] Test verification link expiration
- [ ] Test invalid/expired verification token
- [ ] Verify user can login after email verification

**Note:** Email verification may be disabled in Supabase settings. If disabled, users can login immediately after signup.

## Session Management

**Middleware:** `middleware.ts`

The middleware handles:
- Protected route authentication
- Redirects unauthenticated users to login
- Preserves redirect URLs for post-login redirect

**Protected Routes:**
- `/dashboard` - User dashboard
- `/admin` - Admin dashboard
- `/lawyer` - Lawyer dashboard
- `/kyc` - KYC submission page

**Public Routes:**
- `/` - Homepage
- `/login` - Login page
- `/signup` - Signup page
- `/about`, `/services`, `/pricing`, `/contact`, `/faqs` - Public pages
- `/terms`, `/privacy`, `/disclaimer` - Legal pages

**Session Persistence:**
- Sessions are managed by Supabase Auth
- Cookies are used for session storage
- Sessions persist across page refreshes
- Sessions expire based on Supabase configuration

## Profile Creation

**Trigger Function:** `handle_new_user()`

This function automatically creates a profile when a new user signs up:

1. Triggered on `INSERT` to `auth.users`
2. Extracts `full_name` from OAuth metadata (for OAuth logins)
3. Creates record in `profiles` table
4. Sets default role to 'user'
5. Handles OAuth provider metadata (Google)

**Key Points:**
- Profile is created automatically (no manual step required)
- OAuth users get name extracted from provider metadata
- Email/password users can provide name during signup
- Profile `id` matches `auth.users.id` (UUID)

## Authentication State Management

**Client-Side:** `app/providers.tsx`

- Uses React Context for auth state
- Provides `useAuth()` hook for components
- Manages user session state
- Listens to auth state changes

**Usage:**
```typescript
const { user, loading } = useAuth()
```

## Security Considerations

### ✅ Implemented Security Features

1. **Row Level Security (RLS):**
   - All tables have RLS enabled
   - Users can only access their own data
   - Admins/lawyers have appropriate permissions

2. **Password Security:**
   - Handled by Supabase (bcrypt hashing)
   - Password requirements enforced by Supabase
   - No password storage in plain text

3. **Session Security:**
   - Secure HTTP-only cookies
   - CSRF protection (handled by Supabase)
   - Session expiration

4. **OAuth Security:**
   - OAuth tokens handled by Supabase
   - No OAuth credentials stored in app
   - Secure callback URL validation

5. **Token Security:**
   - Password reset tokens are time-limited
   - Email verification tokens are secure
   - Magic link tokens are single-use

### ⚠️ Areas to Review

1. **Email Verification:**
   - Check if email verification is enabled in Supabase
   - Verify email verification is required for login (optional setting)
   - Test email verification flow

2. **Password Requirements:**
   - Review Supabase password policy settings
   - Ensure strong password requirements
   - Test password complexity requirements

3. **Session Configuration:**
   - Review session expiration settings in Supabase
   - Configure appropriate session timeout
   - Review refresh token settings

4. **OAuth Configuration:**
   - Verify Google OAuth redirect URLs are correctly configured
   - Ensure Google OAuth app is properly set up
   - Test Google OAuth login

## Testing Checklist

### Signup Flow
- [ ] Sign up with email/password
- [ ] Sign up with OAuth (Google)
- [ ] Verify profile is created automatically
- [ ] Test duplicate email handling
- [ ] Test password requirements
- [ ] Test email verification (if enabled)

### Login Flow
- [ ] Login with email/password
- [ ] Login with magic link
- [ ] Login with OAuth providers
- [ ] Test invalid credentials
- [ ] Test session persistence
- [ ] Test redirect after login

### Password Reset Flow
- [ ] Request password reset
- [ ] Verify reset email is sent
- [ ] Complete password reset
- [ ] Test reset token expiration
- [ ] Verify login works with new password

### Email Verification Flow
- [ ] Verify email after signup (if enabled)
- [ ] Test verification link
- [ ] Test expired verification token
- [ ] Verify user can login after verification

### Protected Routes
- [ ] Test access to `/dashboard` without auth (should redirect to login)
- [ ] Test access to `/admin` without admin role (should redirect)
- [ ] Test access to `/lawyer` without lawyer role (should redirect)
- [ ] Verify authenticated users can access protected routes

### Session Management
- [ ] Test session persistence across page refreshes
- [ ] Test logout functionality
- [ ] Test session expiration
- [ ] Verify redirect URLs are preserved

## Common Issues & Solutions

### Issue: Profile not created after signup
**Solution:** Check that `handle_new_user()` trigger exists and is enabled in Supabase

### Issue: OAuth login doesn't create profile
**Solution:** Verify trigger function handles OAuth metadata correctly, check OAuth provider configuration

### Issue: Email verification emails not sending
**Solution:** Check Supabase email settings, verify SMTP is configured, check email templates

### Issue: Password reset emails not sending
**Solution:** Check Supabase email configuration, verify email templates exist

### Issue: Users can't access protected routes after login
**Solution:** Check middleware configuration, verify session is being created, check RLS policies

### Issue: OAuth callback fails
**Solution:** Verify redirect URLs are correctly configured in both Supabase and OAuth provider apps

## Configuration Checklist

### Supabase Dashboard Configuration

- [ ] **Authentication → Providers:**
  - [ ] Email/Password enabled
  - [ ] Magic Link (OTP) enabled (if using)
  - [ ] Google OAuth configured (if using)

- [ ] **Authentication → URL Configuration:**
  - [ ] Site URL set correctly
  - [ ] Redirect URLs configured (include `/auth/callback`)
  - [ ] Allowed redirect URLs include production URL

- [ ] **Authentication → Email Templates:**
  - [ ] Confirm signup email template
  - [ ] Magic Link email template
  - [ ] Change Email Address template
  - [ ] Reset Password email template

- [ ] **Authentication → Settings:**
  - [ ] Email verification requirement (enabled/disabled)
  - [ ] Password requirements configured
  - [ ] Session expiration settings
  - [ ] Refresh token rotation (if applicable)

### Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set to your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set to your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set to your service role key (server-side only)

## Notes

- All authentication is handled by Supabase Auth
- Profile creation is automatic via database trigger
- Session management is handled by Supabase
- OAuth providers require configuration in Supabase Dashboard
- Email verification can be enabled/disabled in Supabase settings
- Password reset uses secure token-based flow
- Magic link authentication is passwordless

## Recommendations

1. **Enable Email Verification:** For production, consider enabling email verification to ensure valid email addresses
2. **Strong Password Policy:** Configure strong password requirements in Supabase
3. **Session Timeout:** Set appropriate session expiration for security
4. **OAuth Configuration:** Configure and test Google OAuth if you plan to support it
5. **Email Templates:** Customize email templates for branding
6. **Monitor Auth Logs:** Use Supabase dashboard to monitor authentication events
7. **Test All Flows:** Thoroughly test all authentication methods before production

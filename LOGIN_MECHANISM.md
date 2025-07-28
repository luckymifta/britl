# Enhanced Login Mechanism Documentation

## Overview

This implementation provides a comprehensive login mechanism with the following key features:

1. **Midnight Token Expiry**: Tokens automatically expire at midnight each day
2. **Automatic Redirect Protection**: Unauthenticated users are redirected to login
3. **Persistent Sessions**: Users stay logged in even after closing browser tabs (until midnight)

## Features Implementation

### 1. Midnight Token Expiry ✅

**Backend Implementation:**
- `create_access_token()` in `app/core/security.py` creates tokens that expire at midnight UTC
- `get_midnight_expiry()` calculates the next midnight timestamp
- JWT tokens include both expiry time and session identification

**Frontend Implementation:**
- Automatic logout timer set based on token expiry
- Session validation checks if token is still valid
- Auto-refresh mechanism for tokens nearing expiry

### 2. Redirect Protection ✅

**AuthGuard Component:**
- Checks authentication status on route access
- Redirects unauthenticated users to `/auth/sign-in`
- Prevents authenticated users from accessing login page
- Shows loading states during authentication checks

**Protected Routes:**
- All `/admin/*` routes are protected via layout
- AuthProvider handles automatic redirects
- Return URL preservation for post-login navigation

### 3. Persistent Browser Sessions ✅

**Cookie-Based Authentication:**
- HTTP-only secure cookies for token storage
- Cookies persist across browser sessions
- Automatic cleanup on logout or expiry

**Session Management:**
- Validates session on app focus/visibility change
- Periodic session validation (every 5 minutes)
- Automatic logout at midnight with custom events

## Technical Architecture

### Backend Components

#### 1. Security Module (`app/core/security.py`)
```python
# Key Functions:
- get_midnight_expiry() # Calculate midnight UTC
- create_access_token() # Create tokens with midnight expiry
- verify_token() # Validate JWT tokens
- refresh_token_if_needed() # Auto-refresh near expiry
```

#### 2. Authentication API (`app/api/auth.py`)
```python
# Endpoints:
POST /api/auth/login # Login with midnight token
POST /api/auth/logout # Clear session cookies
GET /api/auth/validate-session # Check/refresh session
GET /api/auth/check-auth # Quick auth status check
GET /api/auth/me # Get current user info
```

#### 3. Dependency Injection (`app/api/deps.py`)
```python
# Functions:
- get_current_user() # Extract user from cookie or Bearer token
- get_current_active_user() # Ensure user is active
- get_current_admin_user() # Admin-only access
```

### Frontend Components

#### 1. Auth Service (`src/services/auth.service.ts`)
```typescript
// Key Methods:
- login() # Authenticate and store session
- logout() # Clear session and redirect
- checkAuth() # Validate authentication status
- validateSession() # Server-side session validation
- setupAutomaticLogout() # Midnight logout timer
```

#### 2. Auth Provider (`src/components/Auth/AuthProvider.tsx`)
```typescript
// Features:
- Global authentication state
- Automatic route protection
- Session validation intervals
- Browser focus event handling
- Auto-logout event listening
```

#### 3. Auth Guard (`src/components/Auth/AuthGuard.tsx`)
```typescript
// Capabilities:
- Route-level protection
- Loading state management
- Redirect logic
- Return URL handling
```

## Usage Examples

### Protecting a Route
```tsx
// Method 1: Using Layout (recommended for sections)
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}

// Method 2: Per-page protection
import { AuthGuard } from "@/components/Auth/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div>Protected content</div>
    </AuthGuard>
  );
}
```

### Using Authentication State
```tsx
import { useAuth } from "@/components/Auth/AuthProvider";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user?.full_name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Manual Session Validation
```typescript
import { authService } from "@/services/auth.service";

// Check if authenticated locally
const isAuth = authService.isAuthenticated();

// Validate with server
const sessionData = await authService.validateSession();
if (sessionData?.valid) {
  // Session is valid
}
```

## Configuration

### Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours (fallback)
ALGORITHM=HS256
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Security Settings

**Cookie Configuration:**
- `httpOnly: true` - Prevents XSS access
- `secure: true` - HTTPS only (production)
- `sameSite: "lax"` - CSRF protection
- Expires at midnight UTC

**CORS Configuration:**
- Credentials allowed for cookie support
- Specific origin allowlist
- All HTTP methods supported

## Security Considerations

### Token Security
- JWT tokens stored in HTTP-only cookies
- Automatic expiry at midnight
- No sensitive data in localStorage
- Secure cookie flags in production

### Session Management
- Automatic logout on token expiry
- Session validation intervals
- Logout on browser focus (if session invalid)
- Protection against concurrent sessions

### CSRF Protection
- SameSite cookie attribute
- CORS origin validation
- HTTP-only cookie storage

## Testing the Implementation

### 1. Login Flow Test
1. Navigate to `/auth/sign-in`
2. Enter valid credentials
3. Verify redirect to `/admin`
4. Check that session persists on page refresh

### 2. Protection Test
1. Try accessing `/admin` without login
2. Verify redirect to `/auth/sign-in`
3. Login and verify automatic redirect back

### 3. Midnight Expiry Test
1. Login during the day
2. Wait until midnight (or modify system clock)
3. Verify automatic logout occurs

### 4. Browser Persistence Test
1. Login to the application
2. Close browser completely
3. Reopen and navigate to protected route
4. Verify still authenticated (until midnight)

## API Response Examples

### Login Response
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_at": "2025-07-29T00:00:00.000000",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User",
    "is_active": true
  }
}
```

### Session Validation Response
```json
{
  "valid": true,
  "token_refreshed": false,
  "expires_at": "2025-07-29T00:00:00.000000",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User",
    "is_active": true
  }
}
```

## Error Handling

### Common Error Scenarios
- Invalid credentials → Login form error message
- Expired token → Automatic logout and redirect
- Network errors → Graceful fallback with retry
- Server unavailable → Error message with manual retry

### Error Response Format
```json
{
  "detail": "Error description",
  "error_code": "SPECIFIC_ERROR_CODE"
}
```

## Troubleshooting

### Login Issues
1. Check backend server is running
2. Verify CORS configuration
3. Check cookie settings in browser
4. Validate credentials in database

### Session Issues
1. Clear browser cookies
2. Check token expiry times
3. Verify server clock synchronization
4. Check CORS credentials setting

### Redirect Issues
1. Check AuthGuard implementation
2. Verify route protection setup
3. Check browser console for errors
4. Validate redirect URLs

This implementation provides enterprise-grade authentication with automatic security features while maintaining excellent user experience.

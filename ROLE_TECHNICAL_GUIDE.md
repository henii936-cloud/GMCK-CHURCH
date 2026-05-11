# Role System - Technical Implementation Guide

## Architecture Overview

The Church ERP role system is built on a **Role-Based Access Control (RBAC)** architecture with the following layers:

```
┌─────────────────────────────────────────────────┐
│         UI Layer (React Components)              │
│  - Pages view their role-specific dashboards    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Route Protection Layer                     │
│  - AdminRoute, LeaderRoute, FinanceRoute, etc.  │
│  - ProtectedRoute component                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Context Layer (AuthContext)                │
│  - user: { id, email, role, ... }              │
│  - session: Supabase session                    │
│  - loading: boolean                             │
│  - Functions: login, logout, useAuth()          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    Authentication Service (Supabase Auth)       │
│  - Email/password authentication                │
│  - Session management                           │
│  - Token handling                               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Database Layer (Supabase)               │
│  - profiles table: id, role, email, etc.       │
│  - Other data tables with RLS policies          │
└─────────────────────────────────────────────────┘
```

---

## Code Implementation Details

### 1. AuthContext (`src/context/AuthContext.jsx`)

**Key Responsibilities:**

- Load and cache user profile from Supabase
- Manage authentication session state
- Provide user data and role to entire app
- Handle session changes and token refresh

**Key Code Flow:**

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, email, role, full_name, ... }
  const [session, setSession] = useState(null); // Supabase session
  const [loading, setLoading] = useState(true);

  // 1. On mount, get current session
  // 2. Fetch user profile from 'profiles' table
  // 3. Cache profile in localStorage for performance
  // 4. Listen for auth state changes
  // 5. Update user state when auth changes

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Caching Strategy:**

```javascript
const cachedProfile = localStorage.getItem(`profile_${authUser.id}`);
if (cachedProfile) {
  // Set user immediately from cache (fast UI render)
  setUser(JSON.parse(cachedProfile));
}
// Fetch fresh data in background
supabase.from("profiles").select("*").eq("id", authUser.id);
```

### 2. Route Protection Components

#### AdminRoute

```javascript
// Route Guard Pattern - Specific Role
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  // Check exact role match
  const role = user?.role || user?.user_metadata?.role;
  if (role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}
```

#### KidsRoute (Special Case - Multiple Roles)

```javascript
// Note: Kids route allows BOTH kids_ministry AND admin roles
if (role !== "kids_ministry" && role !== "admin") {
  return <Navigate to="/" />;
}
```

**Route Guards Implemented:**

- `AdminRoute` - admin only
- `LeaderRoute` - bible_leader only
- `FinanceRoute` - finance only
- `ManagementRoute` - management only
- `ShepherdRoute` - shepherd only
- `YouthRoute` - youth_ministry only
- `KidsRoute` - kids_ministry OR admin

### 3. ProtectedRoute Component (Granular Control)

```javascript
// Optional per-route fine-grained control
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  // Check if user's role is in allowed roles array
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard
    const rolePath = {
      admin: "/admin",
      bible_leader: "/leader",
      finance: "/finance",
      // ... etc
    };
    return <Navigate to={rolePath[user.role]} />;
  }

  return children;
}
```

**Used in App.jsx:**

```jsx
<Route path="/admin" element={
  <AdminRoute>
    <Layout allowedRoles={['admin']} />
  </AdminRoute>
}>
```

### 4. Sidebar Navigation (`src/components/layout/Sidebar.jsx`)

**Dynamic Menu System:**

```javascript
const menuItems = {
  admin: [
    { name: "Dashboard", icon: Layers, path: "/admin" },
    { name: "Members", icon: Users, path: "/admin/members" },
    // ... more items
  ],
  bible_leader: [
    { name: "My Group Members", icon: Users, path: "/leader" },
    {
      name: "Take Attendance",
      icon: ClipboardList,
      path: "/leader/attendance",
    },
    // ... more items
  ],
  finance: [
    // ... finance specific menu
  ],
  // ... other roles
};

// Get menu for current user's role
const navItems = menuItems[user?.role?.toLowerCase()] || [];
```

---

## Database Schema Integration

### Profiles Table (Supabase)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR,
  role VARCHAR(50),  -- 'admin', 'bible_leader', 'finance', etc.
  full_name VARCHAR,
  church_position VARCHAR,
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Role values:
-- 'admin' - System administrator
-- 'bible_leader' - Bible study group leader
-- 'finance' - Finance manager
-- 'management' - HR/Staff manager
-- 'shepherd' - Pastor/Pastoral leader
-- 'youth_ministry' - Youth leader
-- 'kids_ministry' - Children's ministry leader
-- 'member' - Regular member (default)
```

### Row-Level Security (RLS) Recommendations

```sql
-- Example: Members table accessible based on role
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Admin can see all
CREATE POLICY "admin_see_all_members" ON members
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Bible leaders can see only their group
CREATE POLICY "leader_see_own_group" ON members
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'bible_leader'
    AND group_id = (SELECT assigned_group_id FROM profiles WHERE id = auth.uid())
  );

-- Finance can see all but not edit
CREATE POLICY "finance_view_all" ON members
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'finance'
  );
```

---

## Role Checking Patterns

### Pattern 1: In Components

```javascript
import { useAuth } from "../context/AuthContext";

export default function Component() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminView />;
  }
  if (user?.role === "finance") {
    return <FinanceView />;
  }
  return <DefaultView />;
}
```

### Pattern 2: In Routes

```javascript
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  }
/>
```

### Pattern 3: With Conditional Features

```javascript
{
  user?.role === "admin" && (
    <AdminOnlySection>Delete User Button</AdminOnlySection>
  );
}
```

### Pattern 4: Role-Based Data Access

```javascript
// In API calls
const fetchMembers = async () => {
  if (user?.role === "admin") {
    // Fetch all members
    return supabase.from("members").select("*");
  } else if (user?.role === "bible_leader") {
    // Fetch only their group's members
    return supabase
      .from("members")
      .select("*")
      .eq("group_id", user.assigned_group_id);
  }
};
```

---

## Authentication Flow

### Login Process

```
1. User enters email/password on Login page
2. Call supabase.auth.signInWithPassword()
3. Supabase validates credentials
4. Returns session with user info
5. AuthContext intercepts auth state change
6. Fetches profile from 'profiles' table
7. Caches profile in localStorage
8. Sets user state with role
9. AuthProvider makes user available via useAuth()
10. Route components check user.role
11. User routed to their role's dashboard
```

### Session Refresh

```
1. Supabase detects token expiration
2. Fires 'TOKEN_REFRESHED' event
3. AuthContext re-fetches profile
4. User stays logged in seamlessly
```

### Logout Process

```
1. User clicks logout
2. Call supabase.auth.signOut()
3. AuthContext sets user to null
4. Routes redirect to /login
5. localStorage cache retained (but ignored)
```

---

## Role-Specific Data Management

### Data Owned by Each Role

| Role               | Owns                               | Can View                    | Cannot View      |
| ------------------ | ---------------------------------- | --------------------------- | ---------------- |
| **admin**          | System config, all data            | Everything                  | Nothing          |
| **bible_leader**   | Their group's attendance, progress | Own group members           | Other groups     |
| **finance**        | Donations, expenses, budgets       | All financial data          | Member details   |
| **management**     | Worker records, salaries           | Finance overview            | Member details   |
| **shepherd**       | Ministry structure, evangelism     | Groups, leaders, ministries | Finance, staff   |
| **youth_ministry** | Youth members, events              | Only youth data             | Other ministries |
| **kids_ministry**  | Children, classes, kids events     | Only kids data              | Other ministries |

---

## Security Considerations

### Current Implementation

- ✅ Session-based authentication via Supabase
- ✅ Role stored in user profile (single source of truth)
- ✅ Route-level protection via Route Guards
- ✅ UI elements hidden based on role

### Recommendations for Enhancement

- ❌ Implement Supabase RLS policies (critical!)
- ❌ Validate role on every API call (backend)
- ❌ Use JWT claims for role verification
- ❌ Implement audit logging for role-based actions
- ❌ Add role-based API middleware
- ❌ Implement permission matrix (not just roles)

### RLS Policy Template

```sql
-- Prevent unauthorized data access at database level
CREATE POLICY "enforce_role_access" ON members
  FOR SELECT USING (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Admin sees all
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      OR
      -- Bible leader sees only their group
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'bible_leader'
        AND group_id = (SELECT assigned_group_id FROM profiles WHERE id = auth.uid())
      )
    )
  );
```

---

## Testing Role-Based Features

### Test Cases

```javascript
describe("Role-Based Access Control", () => {
  it("should redirect non-admin users from /admin", () => {
    // Mock user with bible_leader role
    // Navigate to /admin
    // Expect redirect to /leader
  });

  it("should allow admin to access all routes", () => {
    // Mock user with admin role
    // Navigate to each role's route
    // Expect all to succeed
  });

  it("should load correct menu items for each role", () => {
    // For each role
    // Check that sidebar shows correct menu items
    // Check that other roles' items are hidden
  });

  it("should cache user profile in localStorage", () => {
    // Login user
    // Check localStorage for profile_[userId]
    // Verify cache expires appropriately
  });
});
```

---

## Performance Optimizations

### 1. Profile Caching

```javascript
// Fast initial render from localStorage
const cachedProfile = localStorage.getItem(`profile_${authUser.id}`);
if (cachedProfile) setUser(JSON.parse(cachedProfile));

// Fresh data in background
supabase.from("profiles").select("*").eq("id", authUser.id);
```

### 2. Role-Based Code Splitting

```javascript
// Consider lazy loading role-specific pages
const AdminRoute = lazy(() => import("./pages/admin"));
const LeaderRoute = lazy(() => import("./pages/leader"));
```

### 3. Memoization

```javascript
// Prevent unnecessary re-renders
const MemoizedSidebar = memo(Sidebar);
```

---

## Deployment Considerations

1. **Environment Variables**
   - SUPABASE_URL - Set in .env
   - SUPABASE_ANON_KEY - Set in .env

2. **Database Setup**
   - Create 'profiles' table in Supabase
   - Add RLS policies
   - Create role enum type (optional)

3. **Auth Configuration**
   - Enable email authentication in Supabase
   - Configure email confirmation (if needed)
   - Set redirect URLs for auth

4. **Monitoring**
   - Track failed role checks
   - Monitor unauthorized access attempts
   - Log role changes in audit trail

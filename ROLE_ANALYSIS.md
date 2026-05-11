# Church ERP - Role System Analysis

## Overview
The Church ERP system implements a **role-based access control (RBAC)** architecture with 7 distinct roles, each managing different church operations. The system uses Supabase for authentication and a centralized AuthContext for role verification.

---

## Role Hierarchy & Definitions

### 1. **ADMIN** (Super Administrator)
**Role Key:** `admin`

**Responsibilities:**
- Complete system oversight and configuration
- User and member management across all departments
- Access to all features and dashboards
- Manages leaders, groups, and organizational structure
- Financial oversight
- Report generation and analytics

**Accessible Pages:**
```
/admin
├── members (manage all church members)
├── groups (view Bible study groups)
├── leaders (manage group leaders)
├── progress (track study progress)
├── events (manage church events)
├── evangelism (track evangelism activities)
├── ministries (oversee all ministries)
├── finance (comprehensive financial view)
├── budgets (manage all budgets)
├── programs (manage activities and programs)
├── reports (generate system-wide reports)
├── messages (internal communication)
└── settings (system configuration)
```

**Key Features:**
- View-only access to subordinate roles' data
- Can view groups, evangelism, and ministries in read-only mode
- Comprehensive dashboard for decision-making

---

### 2. **ADMIN - BIBLE LEADER** (Bible Study Group Leader)
**Role Key:** `bible_leader`

**Responsibilities:**
- Manage their assigned Bible study group
- Track attendance and member participation
- Record and monitor study progress
- Communication with group members
- Report group activities

**Accessible Pages:**
```
/leader
├── members (view group members)
├── attendance (take attendance for their group)
├── study (record study progress)
├── messages (communicate with group)
└── settings (personal settings)
```

**Integration Points:**
- Part of the overall member hierarchy
- Reports attendance to Admin through system database
- Members belong to their group only
- Study progress feeds into admin analytics

---

### 3. **FINANCE**
**Role Key:** `finance`

**Responsibilities:**
- Record and track financial contributions
- Manage approved budgets and spending
- Track expenses and financial reports
- Generate financial statements
- Manage giving records

**Accessible Pages:**
```
/finance
├── dashboard (financial overview)
├── record (record giving and contributions)
├── budgets (view approved budgets)
├── expenses (track church expenses)
├── messages (financial communications)
└── settings (personal settings)
```

**Integration Points:**
- Records data that Admin reviews in Admin Finance
- Expenses feed into budget management
- Financial reports accessible to Management role
- Cannot create budgets (only view approved ones)

---

### 4. **MANAGEMENT**
**Role Key:** `management`

**Responsibilities:**
- Manage church workers and staff
- Salary management and payroll
- Financial overview for management purposes
- Resource allocation and planning
- Workers and staff administration

**Accessible Pages:**
```
/management
├── dashboard (management overview)
├── workers (manage church workers)
├── salaries (manage payroll)
├── finance (view financial overview)
├── messages (management communications)
└── settings (personal settings)
```

**Integration Points:**
- Manages workers who may have other roles
- Accesses financial data reported by Finance role
- Worker information may affect attendance and reporting
- Coordinates with HR and Finance functions

---

### 5. **SHEPHERD** (Pastoral/Ministry Oversight)
**Role Key:** `shepherd`

**Responsibilities:**
- Oversee Bible study groups and group leaders
- Manage evangelism initiatives
- Coordinate all church ministries
- Pastoral oversight and discipleship
- Ministry planning and coordination

**Accessible Pages:**
```
/shepherd
├── overview (ministry dashboard)
├── groups (manage Bible study groups and leaders)
├── evangelism (track evangelism activities)
├── ministries (manage all ministries)
├── messages (pastoral communications)
└── settings (personal settings)
```

**Integration Points:**
- Works with Bible Leaders under their supervision
- Reviews evangelism data and reports
- Coordinates with other ministries (youth, kids)
- Acts as intermediate between Admin and front-line leaders
- Can view groups and ministries information

---

### 6. **YOUTH MINISTRY**
**Role Key:** `youth_ministry`

**Responsibilities:**
- Manage youth group members
- Plan and coordinate youth events
- Track youth attendance and engagement
- Youth-specific programs and activities
- Youth member development

**Accessible Pages:**
```
/youth
├── dashboard (youth ministry overview)
├── members (manage youth members)
├── events (plan and manage youth events)
├── messages (youth group communications)
└── settings (personal settings)
```

**Integration Points:**
- Youth members tracked separately from general membership
- Events coordinated with overall church calendar
- May interface with Shepherd for ministry coordination
- Reports to Admin for oversight

---

### 7. **KIDS MINISTRY**
**Role Key:** `kids_ministry`

**Responsibilities:**
- Manage kids/children classes and attendance
- Coordinate children's events and activities
- Track children member engagement
- Children's program management
- Age-appropriate ministry delivery

**Accessible Pages:**
```
/kids
├── dashboard (kids ministry overview)
├── members (manage children members)
├── classes (manage children classes)
├── attendance (track children attendance)
├── events (manage kids-specific events)
├── messages (parents/kids communications)
└── settings (personal settings)
```

**Integration Points:**
- Children members tracked in separate database
- Attendance data reported to Admin
- May interface with Shepherd for ministry integration
- Admin can also access kids ministry (**special permission**)
- Separate from general member tracking

---

## Role Integration Architecture

### Authentication Flow
```
User Logs In
    ↓
Supabase Auth (email/password)
    ↓
Fetch Profile from 'profiles' table
    ↓
Extract 'role' field from profile
    ↓
AuthContext stores user with role
    ↓
Role used for routing and access control
```

### Access Control Mechanisms

#### 1. **Route Guards (Role-Based Routing)**
Each role has a dedicated Route component:
- `AdminRoute` → checks `role === "admin"`
- `LeaderRoute` → checks `role === "bible_leader"`
- `FinanceRoute` → checks `role === "finance"`
- `ManagementRoute` → checks `role === "management"`
- `YouthRoute` → checks `role === "youth_ministry"`
- `ShepherdRoute` → checks `role === "shepherd"`
- `KidsRoute` → checks `role === "kids_ministry"` OR `role === "admin"`

#### 2. **Redirect Logic**
If unauthorized:
- User redirected to their role's home dashboard
- Non-logged-in users sent to `/login`
- Invalid role access returns to home (`/`)

#### 3. **Sidebar Navigation**
The Sidebar component shows menu items based on user's role:
```javascript
const navItems = menuItems[user?.role?.toLowerCase()] || [];
```
Each role sees only their permitted menu options.

#### 4. **ProtectedRoute Component**
Used for granular control within routes:
```javascript
if (!allowedRoles.includes(user.role)) {
  return <Navigate to={rolePath[user.role]} />
}
```

---

## Data Flow & Integration Points

### Member Management Integration
```
Admin (creates/manages members)
    ↓
Bible Leaders (view assigned members, take attendance)
    ↓
Attendance data → Admin Reports
    ↓
Progress data → Admin Analytics
```

### Financial Integration
```
Finance (records giving & expenses)
    ↓
Admin (reviews all financial data)
    ↓
Management (views finance overview)
    ↓
Budgets → Admin/Finance for approval
```

### Ministry Coordination
```
Shepherd (oversees all ministries)
    ↓
├── Youth Ministry (youth programs)
    ↓
├── Kids Ministry (children programs)
    ↓
├── Bible Leaders (study groups)
    ↓
└── Evangelism (outreach activities)
    ↓
All data → Admin for system-wide reporting
```

### Event Management
```
Admin/Shepherd (plan events)
    ↓
Youth/Kids/Leaders (execute events)
    ↓
Attendance tracking
    ↓
Reports to Admin
```

---

## Role Relationships & Hierarchies

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN (Super)                          │
│                   (Oversees Everything)                     │
└──────┬────────┬──────────┬────────┬─────────┬────────────────┘
       │        │          │        │         │
       ▼        ▼          ▼        ▼         ▼
   FINANCE  MANAGEMENT SHEPHERD  YOUTH    KIDS_MINISTRY
       │                    │     MINISTRY       │
       │                    │        │           │
       ▼                    ▼        ▼           ▼
   Budgets           Bible Leaders  Youth      Children
   Expenses                         Groups     Classes
   Giving            Groups         Events     Events
                    Evangelism      Members    Members
                    Ministries
```

---

## Key Integration Features

### 1. **Shared Navigation Infrastructure**
- All roles use the same Layout component
- Sidebar adapts based on role
- Messages and Settings available to all roles
- Language toggle (English/Amharic) for all users

### 2. **Unified Authentication Context**
- Single source of truth for user state
- Role information cached in localStorage for performance
- Automatic session refresh with auth state changes
- Fallback to user_metadata if profile fetch fails

### 3. **Data Access Patterns**
- **Admin**: Full read-write access to all data
- **Shepherd**: Oversight of ministry structure
- **Ministry Roles** (Youth, Kids, Leaders): Own department data
- **Finance**: Financial data specific to transactions
- **Management**: Worker and salary data

### 4. **Common Communication Hub**
- All roles have access to Messages
- Messages component routes communication between roles
- Enables cross-role coordination

### 5. **Reporting & Analytics**
- Admin has comprehensive reporting across all areas
- Each role has role-specific analytics on their dashboard
- Data flows from operational roles to Admin for system-wide insights

---

## Potential Integration Challenges & Solutions

### Challenge 1: Role Inconsistency
**Problem:** Some routes check `role !== "finance"` while others use `role?.toLowerCase()`
**Solution:** Standardize role comparison (suggest using `.toLowerCase()` consistently)

### Challenge 2: Permission Expansion
**Problem:** If Admin needs to perform Kids Ministry tasks, route needs explicit handling
**Solution:** Already implemented for Kids Route - allows both `kids_ministry` and `admin`

### Challenge 3: Cross-Role Data Access
**Problem:** Finance viewing member data or Shepherd viewing financial reports
**Solution:** Use API permissions and Supabase RLS (Row-Level Security) to control data visibility

### Challenge 4: Concurrent Role Assignment
**Problem:** Users assigned multiple roles (e.g., Leader + Finance)
**Solution:** Currently not supported - would require role array or permission flags instead of single role

---

## Recommendations for Enhancement

1. **Implement Role-Based API Permissions**
   - Use Supabase RLS policies for data access control
   - Prevent unauthorized API calls even if route is bypassed

2. **Add Permission Matrix**
   - Create a centralized permission configuration
   - Define CRUD permissions per role per resource

3. **Support Multiple Roles**
   - Change `role` field to `roles` array
   - Implement role composition for users with multiple responsibilities

4. **Audit Logging**
   - Log role-based access and data modifications
   - Enable compliance and accountability tracking

5. **Permission Caching**
   - Cache role-based permissions after login
   - Reduce permission checks on every component render

6. **Data Isolation**
   - Implement Supabase Row-Level Security (RLS)
   - Ensure data is filtered at database level, not just UI level

# Role Access Matrix

## Quick Reference: Who Can Access What

| Feature/Module | Admin | Bible Leader | Finance | Management | Shepherd | Youth | Kids |
|---|---|---|---|---|---|---|---|
| **Dashboard** | ✅ Full | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| **Members** | ✅ Full | ✅ Own Group | ❌ | ❌ | ✅ View | ✅ Youth Only | ✅ Kids Only |
| **Bible Study Groups** | ✅ Full | ✅ Own | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **Attendance** | ✅ Full | ✅ Own Group | ❌ | ❌ | ✅ View | ❌ | ✅ Own |
| **Study Progress** | ✅ Full | ✅ Own Group | ❌ | ❌ | ✅ View | ❌ | ❌ |
| **Finance Dashboard** | ✅ Full | ❌ | ✅ Full | ✅ View Only | ❌ | ❌ | ❌ |
| **Record Giving** | ✅ View | ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Budgets** | ✅ Full | ❌ | ✅ View | ❌ | ❌ | ❌ | ❌ |
| **Expenses** | ✅ Full | ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Workers/Staff** | ✅ View | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **Salaries** | ✅ View | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **Evangelism** | ✅ View | ❌ | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **Ministries** | ✅ View | ❌ | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **Youth Events** | ✅ View | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| **Youth Members** | ✅ View | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| **Kids Classes** | ✅ View | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |
| **Kids Attendance** | ✅ View | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |
| **Kids Events** | ✅ View | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |
| **Reports** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Messages** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Settings** | ✅ Full | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ Own | ✅ Own |

---

## Role Delegation Model

```
Church Administration
│
├─ ADMIN (System Owner)
│  │
│  ├── Delegates pastoral work to → SHEPHERD
│  ├── Delegates finance to → FINANCE
│  ├── Delegates HR/staff to → MANAGEMENT
│  └── Oversees all ministries
│
├─ SHEPHERD (Pastor/Pastoral Leader)
│  │
│  ├─ Supervises → BIBLE LEADERS
│  ├─ Coordinates → EVANGELISM
│  ├─ Manages → MINISTRIES
│  └─ Reports to → ADMIN
│
├─ BIBLE LEADER (Group Leaders)
│  │
│  ├─ Manages their Bible Study Group
│  ├─ Records attendance and progress
│  └─ Reports to → SHEPHERD
│
├─ FINANCE (Finance Manager)
│  │
│  ├─ Records giving and donations
│  ├─ Tracks expenses
│  ├─ Manages approved budgets
│  └─ Reports to → ADMIN
│
├─ MANAGEMENT (HR/Staff Manager)
│  │
│  ├─ Manages church workers/staff
│  ├─ Handles payroll and salaries
│  ├─ Views financial overview
│  └─ Reports to → ADMIN
│
├─ YOUTH MINISTRY (Youth Pastor)
│  │
│  ├─ Manages youth members
│  ├─ Plans youth events
│  └─ Coordinates with → SHEPHERD
│
└─ KIDS MINISTRY (Children's Pastor)
   │
   ├─ Manages children/kids
   ├─ Manages children classes
   ├─ Plans kids events
   └─ Coordinates with → SHEPHERD & ADMIN
```

---

## Data Flow Between Roles

### 1. Member Tracking Flow
```
Bible Leader (records attendance/progress)
    ↓
Shepherd (reviews group data)
    ↓
Admin (generates overall reports)
```

### 2. Financial Flow
```
Finance (records all transactions)
    ↓
Management (views financial overview)
    ↓
Admin (makes decisions/approves budgets)
```

### 3. Ministry Coordination Flow
```
Shepherd (oversees strategy)
    ↓
├─ Bible Leaders (execute study groups)
├─ Youth Ministry (execute youth programs)
├─ Kids Ministry (execute children programs)
└─ Evangelism leads (execute outreach)
```

### 4. Event Management Flow
```
Shepherd/Youth/Kids (plan event)
    ↓
Record attendance
    ↓
Report to Admin
```

---

## Integration Summary

### By Department

**Leadership Department:**
- Admin and Shepherd form the strategic leadership
- Shepherd supervises Bible Leaders
- All report flow to Admin

**Operations Department:**
- Finance manages monetary flow
- Management manages human resources
- Both provide insights to Admin

**Ministry Department:**
- Youth and Kids ministries operate independently
- Coordinate through Shepherd
- Report attendance/metrics to Admin

### Key Integration Points

1. **Authentication Hub**
   - All roles authenticate through Supabase
   - Role stored in user profile
   - AuthContext manages role state

2. **Communication Hub**
   - All roles can message each other
   - Shared Messages component
   - Cross-role coordination tool

3. **Reporting Hub**
   - Admin sees all data
   - Aggregates from all operational roles
   - Generates system-wide reports

4. **Data Consistency**
   - Single source of truth (Supabase)
   - Each role modifies only their domain
   - Admin has read access to all domains

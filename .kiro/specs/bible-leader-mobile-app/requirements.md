# Bible Leader Mobile App — Requirements

## Overview

A React Native mobile application built with **Expo SDK 54**, exclusively for the **Bible Leader** role (`bible_leader`). The app mirrors the web app's leader section and connects to the same **Supabase** backend. Bible Leaders can manage their assigned group, take attendance, log study progress, and communicate — all from their phone.

---

## Files Related to the Bible Leader Role (Web App)

These are the source files that define the Bible Leader's scope and must be replicated in the mobile app:

| File | Purpose |
|---|---|
| `src/pages/leader/LeaderDashboard.tsx` | Main dashboard — group info, member count, quick actions |
| `src/pages/leader/Attendance.tsx` | Take attendance (Present / Absent / Excused) + history |
| `src/pages/leader/Members.tsx` | View group members list with contact info |
| `src/pages/leader/Study.tsx` | Log study progress or skip session |
| `src/pages/common/Messages.tsx` | Chat — role channel, group channel, direct messages |
| `src/pages/common/Settings.tsx` | Profile, password, notification preferences |
| `src/context/AuthContext.tsx` | Auth logic — login, session, role check |
| `src/services/api.js` | All Supabase service calls (attendance, study, members, groups) |
| `src/services/supabaseClient.js` | Supabase client initialization |
| `src/components/common/AttendanceHistory.tsx` | Attendance history sub-component |
| `src/components/common/EtDatePicker.tsx` | Ethiopian calendar date picker |
| `ROLE_ACCESS_MATRIX.md` | Defines what Bible Leader can and cannot access |
| `ROLE_ANALYSIS.md` | Role hierarchy and integration points |
| `ROLE_TECHNICAL_GUIDE.md` | Auth flow, route guards, DB schema |

---

## Requirements

### REQ-1: Authentication

**REQ-1.1** The app MUST authenticate users via Supabase email/password.

**REQ-1.2** After login, the app MUST fetch the user's profile from the `profiles` table and verify `role === 'bible_leader'`. Any other role MUST be rejected with a clear message.

**REQ-1.3** The app MUST cache the user profile locally (AsyncStorage) for fast re-launch, matching the web app's localStorage strategy.

**REQ-1.4** The app MUST support session persistence — users stay logged in across app restarts until they explicitly log out.

**REQ-1.5** The app MUST handle token refresh automatically via Supabase's `onAuthStateChange`.

**REQ-1.6** The app MUST log login and logout events to the `login_logs` and `activity_logs` tables, consistent with the web app.

---

### REQ-2: Dashboard

**REQ-2.1** On first launch (no group assigned), the app MUST show a group selection screen listing all unassigned Bible study groups from `bible_study_groups`.

**REQ-2.2** The leader MUST be able to claim an available group, which inserts a record into `group_leaders`.

**REQ-2.3** Once a group is assigned, the dashboard MUST display:
- Leader's name and group name
- Total member count for the group
- Quick-action buttons: View Members, Take Attendance, Log Study
- Next session date/time (static or from events table)
- Recent activity feed (last attendance record, last study log)

**REQ-2.4** The dashboard MUST show a loading state while fetching data.

---

### REQ-3: Group Members

**REQ-3.1** The app MUST display all members belonging to the leader's assigned group (filtered by `group_id`).

**REQ-3.2** Each member card MUST show: full name, phone, email, address, status (Active / Inactive / Leave).

**REQ-3.3** The app MUST support search/filter by name, email, or phone.

**REQ-3.4** The app MUST show a member avatar (image_url) or a fallback initial avatar.

**REQ-3.5** The leader MUST NOT be able to add, edit, or delete members (read-only, consistent with web app).

---

### REQ-4: Attendance

**REQ-4.1** The app MUST allow the leader to take attendance for their group members.

**REQ-4.2** Each member MUST have three status options: **Present**, **Absent**, **Excused**.

**REQ-4.3** The app MUST default all members to "Present" when opening the attendance screen.

**REQ-4.4** The app MUST provide bulk actions: "All Present", "All Absent", "All Excused".

**REQ-4.5** The app MUST show a live count of Present / Absent / Excused members.

**REQ-4.6** On submission, attendance records MUST be saved to the `study_attendance` table with `member_id`, `group_id`, `status`, and today's date.

**REQ-4.7** If attendance has already been taken today, the app MUST show a "Attendance Complete" state and prevent duplicate submission.

**REQ-4.8** The app MUST display an attendance history tab showing past records from `study_attendance`.

**REQ-4.9** The app MUST display dates in the **Ethiopian calendar** format, consistent with the web app.

---

### REQ-5: Study Progress

**REQ-5.1** The app MUST allow the leader to log a study session with: study topic, completion date (Ethiopian calendar picker), and notes/reflections.

**REQ-5.2** The app MUST support a "Skip Session" mode where the leader logs a skipped session with a mandatory reason.

**REQ-5.3** On submission, the record MUST be saved to the `study_progress` table with `study_topic`, `completion_date`, `notes`, `group_id`, and `leader_id`.

**REQ-5.4** The app MUST show a success or error message after submission.

**REQ-5.5** The app MUST inform the leader that their log is visible to Admin immediately.

---

### REQ-6: Messages (Chat)

**REQ-6.1** The app MUST provide a chat interface with the following channels available to Bible Leaders:
- **Ministry Channel** (`role:bible_leader`) — leader-only channel
- **Leadership Channel** (`role:admin_shepherd`) — shared with Admin and Shepherd
- **Group Channel** (`group:<group_id>`) — their assigned group's channel only
- **Direct Messages** — 1-on-1 with any user

**REQ-6.2** Messages MUST be fetched from and saved to the `messages` table in Supabase.

**REQ-6.3** The app MUST support real-time message delivery using Supabase Realtime subscriptions.

**REQ-6.4** The app MUST show sender name, role badge, message content, and timestamp.

**REQ-6.5** The app MUST support optimistic UI — messages appear instantly before server confirmation.

**REQ-6.6** The app MUST allow starting a new Direct Message with any user from a user search modal.

**REQ-6.7** The app MUST auto-scroll to the latest message.

---

### REQ-7: Settings

**REQ-7.1** The app MUST allow the leader to update their profile: full name, phone number, bio.

**REQ-7.2** The app MUST allow uploading a profile photo to Supabase Storage (`avatars` bucket).

**REQ-7.3** The app MUST allow changing the account password via `supabase.auth.updateUser`.

**REQ-7.4** The app MUST display the user's role as read-only (cannot be changed in-app).

**REQ-7.5** The app MUST allow toggling in-app and email notification preferences, saved to the `profiles` table.

**REQ-7.6** The app MUST provide a logout button that calls `supabase.auth.signOut` and clears local cache.

---

### REQ-8: Navigation & UX

**REQ-8.1** The app MUST use a bottom tab navigator with tabs: **Home**, **Members**, **Attendance**, **Study**, **Messages**.

**REQ-8.2** Settings MUST be accessible from a profile icon in the header or as a tab.

**REQ-8.3** The app MUST support both **light and dark mode**, following the device system preference.

**REQ-8.4** The app MUST support both **English and Amharic** languages (i18n), consistent with the web app.

**REQ-8.5** All screens MUST show appropriate loading states and empty states.

**REQ-8.6** The app MUST handle network errors gracefully with user-friendly messages.

---

### REQ-9: Security & Access Control

**REQ-9.1** The app MUST enforce role-based access — only `bible_leader` users can use the app.

**REQ-9.2** The app MUST NOT expose or allow access to any other role's data (finance, admin, management, etc.).

**REQ-9.3** All Supabase queries MUST rely on the authenticated session token; no anonymous data access.

**REQ-9.4** Sensitive data (session tokens, profile cache) MUST be stored in **Expo SecureStore**, not plain AsyncStorage.

---

### REQ-10: Technical Stack

**REQ-10.1** The app MUST be built with **React Native** using **Expo SDK 54**.

**REQ-10.2** The app MUST use **Expo Router** (file-based routing) for navigation.

**REQ-10.3** The app MUST use the **same Supabase project** as the web app (shared `.env` variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

**REQ-10.4** The app MUST use **TypeScript**.

**REQ-10.5** The app MUST use **NativeWind** (Tailwind CSS for React Native) for styling, consistent with the web app's design language.

**REQ-10.6** The app MUST target both **iOS** and **Android**.

**REQ-10.7** The project MUST live in a separate folder: `bible-leader-mobile/` alongside the web app.

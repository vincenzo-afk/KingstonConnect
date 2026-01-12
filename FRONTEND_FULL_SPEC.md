# KingstonConnect Frontend Full Specification

> **Generated:** January 12, 2026  
> **Project:** KingstonConnect - College Management Platform  
> **Version:** 1.0.0

---

## Table of Contents
1. [High-Level Overview](#1-high-level-overview)
2. [User Flows (Frontend Only)](#2-user-flows-frontend-only)
3. [Routes, Pages, and Layouts](#3-routes-pages-and-layouts)
4. [Components and Props](#4-components-and-props)
5. [Styling, Theming, and Responsiveness](#5-styling-theming-and-responsiveness)
6. [Frontend State and Data Handling](#6-frontend-state-and-data-handling)
7. [Frontend Features List (Checklist)](#7-frontend-features-list-checklist)
8. [Recommended Improvements (Frontend Only)](#8-recommended-improvements-frontend-only)
9. [How to Extend This Frontend](#9-how-to-extend-this-frontend)

---

# 1. High-Level Overview

## Application Description
**KingstonConnect** is a comprehensive college management web platform designed for Kingston Engineering College. It provides seamless communication, collaboration, and academic management for students, teachers, HODs (Heads of Department), and principals.

The application offers role-based dashboards with features including:
- Academic tracking (attendance, results, assignments)
- Study assistance via AI (StudyGPT)
- Real-time chat and messaging
- Timetable management
- Notes sharing and collaboration
- Announcements and notifications
- Integration with Anna University Portal (AU Portal)
- Calendar and event management

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19.2.0 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7.2.4 |
| **Routing** | React Router DOM 7.12.0 |
| **Styling** | Tailwind CSS 4.1.18 |
| **State Management** | Zustand 5.0.9 |
| **Data Fetching** | TanStack React Query 5.90.16 |
| **Icons** | Lucide React 0.562.0 |
| **Charts** | Recharts 3.6.0 |
| **PDF Generation** | @react-pdf/renderer 4.3.2 |
| **Date Utilities** | date-fns 4.1.0 |
| **Class Utilities** | clsx 2.1.1, tailwind-merge 3.4.0 |
| **Backend Services** | Firebase 12.7.0, Supabase JS 2.90.1 |

## Key UI Libraries
- **Lucide React**: Icon library with 1000+ icons
- **Recharts**: Composable charting library for data visualization
- **@react-pdf/renderer**: PDF document generation
- **Google Fonts**: Inter (primary), Outfit & JetBrains Mono (alternate)

---

# 2. User Flows (Frontend Only)

## 2.1 Authentication Flow

### Login Flow
1. **User lands on** `/login` page
2. **UI Elements**: Logo, register number input, password input (with show/hide toggle), "Remember me" checkbox, "Forgot password" link
3. **User enters** register number (auto-uppercased) and password
4. **Validation**: Client-side validation for empty fields
5. **On Submit**: Loading state with spinner, button disabled
6. **On Success**: Redirect to `/dashboard`
7. **On Error**: Error message displayed in red alert box

### Registration Flow
1. **User navigates to** `/register` from login page
2. **Form Fields**:
   - Full name (with User icon)
   - Register number (with GraduationCap icon)
   - Email (with Mail icon)
   - Password & Confirm Password (with Key icon)
   - Department (select dropdown)
   - Year (1-4 select)
   - Section (A/B/C select)
3. **Validation**: All required fields, password match, minimum 6 characters
4. **On Success**: Redirect to `/dashboard`
5. **On Error**: Error message in alert box

## 2.2 Dashboard Flow

### Role-Based Dashboard Rendering
1. **User accesses** `/dashboard`
2. **Auth Check**: If not authenticated, redirect to `/login`
3. **Role Detection**: Check `user.role` from auth store
4. **Render Role-Specific Dashboard**:
   - `principal`: PrincipalDashboard component
   - `hod`: HODDashboard component
   - `teacher`: TeacherDashboard component
   - `student`: StudentDashboard component

### Student Dashboard Experience
1. **Stats Cards**: CGPA, Attendance %, At-Risk status, Upcoming exams
2. **Quick Actions**: View timetable, Check results, Upload notes
3. **Recent Activity**: Latest notifications, Due assignments
4. **AI Integration**: Quick access to StudyGPT

## 2.3 Attendance Management Flow

### Teacher Marking Attendance
1. **Select** class section and subject
2. **View** student list with search/filter
3. **Mark** each student: Present/Absent/Late
4. **Quick Action**: "Mark All Present" button
5. **Save**: Submit attendance with loading state
6. **Feedback**: Success notification

### Student Viewing Attendance
1. **View** attendance statistics cards
2. **See** subject-wise breakdown
3. **Track** monthly calendar view
4. **Warning**: Low attendance alerts (<75%)

## 2.4 StudyGPT AI Assistant Flow

1. **User opens** `/studygpt` page
2. **Chat Interface**: Message history, input field, send button
3. **Suggested Prompts**: Quick starter questions
4. **Compose Message**: Type question, optionally attach files
5. **Send Message**: Loading animation, streaming response
6. **AI Response**: Markdown-formatted content with code blocks
7. **Actions**: Copy message, regenerate response, export chat
8. **Settings**: Configure AI model, temperature, context

## 2.5 Notes Sharing Flow

1. **Browse Notes**: Grid/list view with search and filters
2. **Filter By**: Subject, file type, upload date, status
3. **Upload Modal**: Title, subject, description, file upload
4. **Download**: Direct download with counter
5. **Approval System**: Pending/Approved/Rejected badges (for teachers)

## 2.6 Chat and Messaging Flow

1. **Chat List**: Sidebar with recent conversations
2. **Search Users**: Find students/teachers to message
3. **Select Chat**: Load message history
4. **Send Message**: Real-time message delivery
5. **Group Chats**: Create groups with multiple participants
6. **Attachments**: File and image sharing

## 2.7 AU Portal Integration Flow

1. **Check Connection**: API availability check
2. **Not Linked State**: "Link Account" modal appears
3. **Enter Credentials**: Register number and DOB
4. **Captcha Challenge**: Display captcha image, audio option
5. **Submit Captcha**: Fetch student data from AU portal
6. **Display Data**: Profile, exam schedule, results, internals
7. **Cache Data**: Store locally for offline access
8. **Refresh**: Manual refresh button

---

# 3. Routes, Pages, and Layouts

## 3.1 Route Configuration

| Route | Page Component | Purpose | Access |
|-------|----------------|---------|--------|
| `/` | Redirect | Redirects to `/dashboard` | Public |
| `/login` | `LoginPage` | User authentication | Public |
| `/register` | `RegisterPage` | New user registration | Public |
| `/dashboard` | `DashboardPage` | Role-based main dashboard | Protected |
| `/studygpt` | `StudyGPTPage` | AI study assistant | Protected |
| `/attendance` | `AttendancePage` | Attendance management | Protected |
| `/results` | `ResultsPage` | Academic results | Protected |
| `/calendar` | `CalendarPage` | Event calendar | Protected |
| `/timetable` | `TimetablePage` | Class schedule | Protected |
| `/assignments` | `AssignmentsPage` | Assignment management | Protected |
| `/notes` | `NotesPage` | Notes sharing | Protected |
| `/chat` | `ChatPage` | Real-time messaging | Protected |
| `/announcements` | `AnnouncementsPage` | College announcements | Protected |
| `/au-portal` | `AUPortalPage` | AU integration | Protected (Students) |
| `/profile` | `ProfilePage` | User profile | Protected |
| `/settings` | `SettingsPage` | App settings | Protected |
| `/students` | `StudentsPage` | Student directory | Protected |
| `/teachers` | `TeachersPage` | Teacher directory | Protected |
| `/departments` | `DepartmentsPage` | Department overview | Protected |
| `*` | Redirect | Catch-all to `/dashboard` | Any |

## 3.2 Layout Structure

### DashboardLayout (`src/components/layout/DashboardLayout.tsx`)
The main layout wrapper for all protected routes.

```
┌─────────────────────────────────────────────────────────────┐
│                     DashboardLayout                          │
├──────────┬──────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────┐ │
│          │  │              Header (Fixed)                  │ │
│ Sidebar  │  ├─────────────────────────────────────────────┤ │
│ (Fixed)  │  │                                             │ │
│          │  │             Main Content                     │ │
│ 64px     │  │            (<Outlet />)                      │ │
│ or       │  │                                             │ │
│ 256px    │  │           Animated fade-in                   │ │
│          │  │                                             │ │
│          │  └─────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

### Layout Features:
- **Sidebar**: Fixed position, collapsible (256px → 80px)
- **Header**: Fixed top, adjusts left margin based on sidebar state
- **Main Content**: Scrollable, max-width 1920px, responsive padding
- **Loading State**: Branded loader with "K" logo animation
- **Auth Guard**: Redirects to `/login` if not authenticated

## 3.3 Page File Locations

```
src/pages/
├── Login.tsx           # Authentication login
├── Register.tsx        # User registration
├── Dashboard.tsx       # Role-based dashboard router
├── StudyGPT.tsx        # AI chat wrapper
├── Attendance.tsx      # Attendance management
├── Results.tsx         # Academic results
├── Calendar.tsx        # Event calendar
├── Timetable.tsx       # Class schedule
├── Assignments.tsx     # Assignment management
├── Notes.tsx           # Notes sharing
├── Chat.tsx            # Messaging
├── Announcements.tsx   # Announcements
├── AUPortal.tsx        # AU integration wrapper
├── Profile.tsx         # User profile
├── Settings.tsx        # App settings
├── Students.tsx        # Student directory
├── Teachers.tsx        # Teacher directory
└── Departments.tsx     # Department overview
```

---

# 4. Components and Props

## 4.1 UI Components (`src/components/ui/`)

### Avatar (`Avatar.tsx`)

```typescript
interface AvatarProps {
  src?: string;           // Image URL
  alt?: string;           // Alt text
  name?: string;          // Name for initials fallback
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Size variant
  status?: 'online' | 'offline' | 'busy' | 'away';  // Status indicator
  glow?: boolean;         // Glow effect
}
```

**Also exports**: `AvatarGroup` for stacked avatars with overflow count.

### Badge (`Badge.tsx`)

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;          // Show status dot
  glow?: boolean;         // Glow effect
  children: React.ReactNode;
}
```

**Also exports**: `RoleBadge` (role-specific styling), `CounterBadge` (notification counts).

### Button (`Button.tsx`)

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;      // Show spinner
  icon?: React.ReactNode; // Icon element
  iconPosition?: 'left' | 'right';
  glow?: boolean;         // Glow effect for primary
}
```

### Card (`Card.tsx`)

```typescript
interface CardProps {
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hover?: boolean;        // Hover animation
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;         // Glow effect
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent' | 'info';
  trend?: { value: number; label: string; positive?: boolean };
}
```

**Also exports**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `StatCard`.

### Input (`Input.tsx`)

```typescript
interface InputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

interface TextareaProps {
  label?: string;
  error?: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}
```

### Modal (`Modal.tsx`)

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  closeOnOverlay?: boolean;
  footer?: React.ReactNode;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}
```

### NotificationCenter (`NotificationCenter.tsx`)

```typescript
interface Notification {
  id: string;
  type: 'attendance' | 'result' | 'assignment' | 'announcement' | 'chat' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}
```

**Custom Hook**: `useNotifications()` for notification state management.

## 4.2 Layout Components (`src/components/layout/`)

### Header (`Header.tsx`)
**Purpose**: Top navigation bar with search, notifications, theme toggle, and profile menu.

**Features**:
- Dynamic page title based on route
- Welcome message with user's first name
- Search input (hidden on mobile)
- Theme toggle (dark/light)
- Notification bell with unread count badge
- Profile dropdown with navigation links

### Sidebar (`Sidebar.tsx`)
**Purpose**: Main navigation with role-based menu items.

**Features**:
- Collapsible (256px ↔ 80px)
- Mobile overlay with backdrop
- Role-filtered navigation items
- Active state with cyan indicator
- Tooltips in collapsed state
- User profile footer section
- Sign out button

**Navigation Items Structure**:
```typescript
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];  // 'student' | 'teacher' | 'hod' | 'principal'
  badge?: number;
}
```

## 4.3 Dashboard Components (`src/components/dashboard/`)

### StudentDashboard
- Welcome banner
- Stats cards (CGPA, Attendance, Credits, Rank)
- Quick actions grid
- Upcoming deadlines
- Recent activity feed

### TeacherDashboard
- Class overview stats
- Today's schedule
- Student at-risk alerts
- Pending assignments
- Quick attendance marking

### HODDashboard
- Department statistics
- Teacher directory summary
- At-risk students list
- Section performance chart
- Pending approvals

### PrincipalDashboard
- College-wide statistics
- Department comparison chart
- System alerts
- Recent announcements
- Quick analytics

## 4.4 Feature Components

### StudyGPTChat (`src/components/ai/StudyGPTChat.tsx`)
**Purpose**: AI-powered study assistant chat interface.

**Features**:
- Message history with alternating bubbles
- Markdown rendering for AI responses
- Code syntax highlighting
- File attachments support
- Copy message to clipboard
- Regenerate response
- Settings modal (model, temperature)
- Suggested prompts
- Loading animation during response

### AUPortalIntegration (`src/components/au/AUPortalIntegration.tsx`)
**Purpose**: Integration with Anna University student portal.

**Features**:
- Multi-step account linking modal
- Captcha image display and audio playback
- Student profile display
- Exam schedule section
- Results table with grades
- Internals marks display
- CGPA calculation
- Attendance metrics
- Collapsible sections with animations

---

# 5. Styling, Theming, and Responsiveness

## 5.1 Styling Approach

The application uses **Tailwind CSS 4.1** with custom CSS classes and utilities:

- **Base Styles**: `src/index.css` - Global styles, CSS variables, keyframes
- **Component Styles**: `src/App.css` - Legacy/root styles
- **Utility Classes**: Tailwind utilities with `cn()` helper for conditional classes

## 5.2 Theme System

### CSS Custom Properties (Dark Theme - Default)
```css
:root {
  /* Background Colors */
  --color-bg-primary: #0a0f14;     /* Darkest background */
  --color-bg-secondary: #131b24;   /* Card background */
  --color-bg-tertiary: #1e293b;    /* Elevated surface */

  /* Accent Colors */
  --color-accent: #06b6d4;         /* Cyan-500 primary */
  --color-accent-glow: rgba(6, 182, 212, 0.5);

  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #94a3b8;   /* Slate-400 */
  --color-text-tertiary: #64748b;    /* Slate-500 */

  /* Glass Effects */
  --glass-border: rgba(255, 255, 255, 0.05);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);

  /* Border Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* Layout */
  --header-height: 5rem;           /* 80px */
  --sidebar-width: 16rem;          /* 256px */
  --sidebar-width-collapsed: 5rem; /* 80px */
}
```

### Light Theme Overrides
```css
[data-theme="light"] {
  --color-bg-primary: #f8fafc;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
```

## 5.3 Design System

### Typography
- **Primary Font**: `'Outfit', sans-serif` - Modern geometric sans-serif
- **Monospace Font**: `'JetBrains Mono'` - For code blocks
- **Fallback**: `'Inter', sans-serif` (loaded via Google Fonts)

### Color Palette

| Purpose | Color | Hex/Class |
|---------|-------|-----------|
| Primary Accent | Cyan | `#06b6d4` / `cyan-500` |
| Secondary Accent | Sky | `#0ea5e9` / `sky-500` |
| Success | Emerald | `#10b981` / `emerald-500` |
| Warning | Amber | `#f59e0b` / `amber-500` |
| Error | Red | `#ef4444` / `red-500` |
| Info | Blue | `#3b82f6` / `blue-500` |

### Glassmorphism Effects
```css
.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

### Gradient Effects
```css
.card-gradient {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.text-gradient {
  background: linear-gradient(to right, #22d3ee, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 5.4 Animation System

### Keyframe Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Animation Classes
- `.animate-fade-in` - Simple fade in
- `.animate-fade-in-up` - Fade in with upward motion
- `.animate-slide-up` - Slide up with fade
- `.animate-pulse` - Pulsing effect (Tailwind default)
- `.animate-spin` - Continuous rotation

## 5.5 Responsiveness

### Breakpoints (Tailwind Defaults)
| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Responsive Patterns

**Sidebar Behavior**:
- Mobile (`<1024px`): Hidden by default, overlay when open
- Desktop (`>=1024px`): Always visible, collapsible

**Grid Layouts**:
```jsx
// Example responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

**Content Container**:
```css
.page-container {
  padding: 1.5rem;  /* Mobile */
}
@media (min-width: 1024px) {
  .page-container {
    padding: 2rem;  /* Desktop */
  }
}
```

### Mobile Optimizations
- Touch-friendly tap targets (min 44px)
- Hidden search bar on mobile (Header)
- Horizontal scroll for tables
- Stacked forms on mobile
- Bottom sheet modals on mobile

## 5.6 Custom Scrollbar
```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}
```

---

# 6. Frontend State and Data Handling

## 6.1 State Management Architecture

### Zustand Stores (`src/store/`)

#### AuthStore (`authStore.ts`)
**Purpose**: Authentication and user profile management.

```typescript
interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (registerNo: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  clearError: () => void;
}
```

**Persistence**: Uses Zustand's `persist` middleware with localStorage (`'kec-auth'`).

#### UIStore (`uiStore.ts`)
**Purpose**: UI state management (theme, sidebar, toasts).

```typescript
interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  pinModalOpen: boolean;
  pinVerified: boolean;

  // Theme
  theme: 'dark' | 'light';

  // Toasts
  toasts: Toast[];

  // Loading
  globalLoading: boolean;
  loadingMessage: string;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  openPinModal: () => void;
  closePinModal: () => void;
  setPinVerified: (verified: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}
```

**Helper Hook**: `useToast()` for convenient toast creation.

## 6.2 Data Fetching Strategy

### TanStack React Query
Configured with:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
    },
  },
});
```

### Data Flow Patterns

1. **Page-Level Fetching**: Pages fetch their own data in `useEffect`
2. **Component State**: Local `useState` for component-specific data
3. **Mock Data**: Many pages use mock data arrays for demonstration
4. **Service Layer**: `src/services/` contains data fetching logic

### Services (`src/services/`)

#### auportal.service.ts
- `initAUSession()` - Initialize AU portal session
- `fetchDataWithCaptcha()` - Fetch student data with captcha
- `getCaptchaAudioUrl()` - Get audio captcha URL
- `getCachedStudentData()` - Retrieve cached data
- `getMockStudentData()` - Get mock demonstration data
- `calculateCGPA()` - Calculate CGPA from results

#### chat.service.ts
- `getChatRooms()` - Fetch chat room list
- `getMessages()` - Get messages for a room
- `sendMessage()` - Send new message
- `createGroup()` - Create group chat

#### studygpt.service.ts
- `sendStudyQuery()` - Send query to AI
- `getStudySessions()` - Get past sessions
- `saveSession()` - Save chat session

## 6.3 Type Definitions (`src/types/index.ts`)

### Core Types
```typescript
type UserRole = 'student' | 'teacher' | 'hod' | 'principal';

interface Profile {
  id: string;
  register_no: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department_id?: string;
  year?: number;
  section?: string;
  pin_hash?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Feature Types
- `Department`, `Section` - Organization structure
- `Attendance`, `AttendanceStats` - Attendance tracking
- `Test`, `Result`, `SubjectMark` - Academic results
- `CalendarEvent` - Calendar events
- `Note`, `NoteChunk` - Notes sharing
- `Chat`, `Message`, `MessageAttachment` - Messaging
- `Announcement` - Announcements
- `Notification` - Notifications
- `Toast` - UI toasts

## 6.4 Utility Functions (`src/lib/utils.ts`)

### Class Name Utility
```typescript
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Date Formatting
```typescript
function formatDate(date: string | Date, format: 'short' | 'long' | 'relative'): string;
function formatTime(date: string | Date): string;
```

### Validation
```typescript
function isValidRegisterNo(registerNo: string): boolean;
function isValidEmail(email: string): boolean;
function isValidPhone(phone: string): boolean;
```

### Calculations
```typescript
function calculatePercentage(value: number, total: number): number;
function getGrade(percentage: number): string;
function getGradeColor(grade: string): string;
function getAttendanceColor(status: string): string;
```

---

# 7. Frontend Features List (Checklist)

## Authentication & Authorization
- [x] Login page with register number/password
- [x] Password visibility toggle
- [x] Remember me checkbox
- [x] Forgot password link (placeholder)
- [x] Registration form with all fields
- [x] Department/Year/Section selection
- [x] Role-based access control
- [x] Session persistence (localStorage)
- [x] Auto-redirect for authenticated users
- [x] Logout functionality

## Dashboard
- [x] Role-based dashboard rendering
- [x] Student dashboard with stats
- [x] Teacher dashboard with class overview
- [x] HOD dashboard with department stats
- [x] Principal dashboard with college overview
- [x] Quick action cards
- [x] Activity feed
- [x] At-risk student alerts
- [x] Upcoming events display

## Navigation & Layout
- [x] Collapsible sidebar
- [x] Mobile responsive sidebar (overlay)
- [x] Role-filtered navigation items
- [x] Active route highlighting
- [x] Tooltips in collapsed mode
- [x] Fixed header with scroll
- [x] Dynamic page titles
- [x] User profile dropdown
- [x] Theme toggle (dark/light)
- [x] Global search input

## Attendance
- [x] Attendance statistics cards
- [x] Subject-wise breakdown
- [x] Calendar view with events
- [x] Student list with status
- [x] Mark attendance (Present/Absent/Late)
- [x] Mark all present button
- [x] Search and filter students
- [x] Save attendance with confirmation

## Results & Tests
- [x] Test list with status badges
- [x] Results table with sorting
- [x] Grade calculation and display
- [x] Color-coded grades
- [x] Search students by name/register number
- [x] Test details modal
- [x] Performance statistics

## Calendar
- [x] Monthly calendar view
- [x] Event indicators on dates
- [x] Category-based event colors
- [x] Event details popup
- [x] Navigation (prev/next month)
- [x] Today highlighting
- [x] Integration with AU Portal exams

## Timetable
- [x] Weekly grid view
- [x] Time slots with subjects
- [x] Color-coded by type (lecture/lab/tutorial)
- [x] Room and teacher info
- [x] Current day highlighting
- [x] Click for slot details
- [x] List view toggle

## Assignments
- [x] Assignment cards with status
- [x] Due date countdown
- [x] Submission progress bar
- [x] File attachments display
- [x] Create assignment modal (teachers)
- [x] Submission view modal
- [x] Grading interface

## Notes Sharing
- [x] Notes grid/list view
- [x] Subject filtering
- [x] Search functionality
- [x] File type icons
- [x] Download counter
- [x] Upload modal with form
- [x] Approval status badges
- [x] File preview links

## Chat & Messaging
- [x] Chat room list sidebar
- [x] Real-time message history
- [x] Message input with send
- [x] Create group modal
- [x] Online status indicators
- [x] Unread message badges
- [x] User search
- [x] Attachment support

## Announcements
- [x] Announcement cards
- [x] Scope badges (college/department/section)
- [x] Pinned announcements
- [x] Create announcement modal
- [x] Attachment support
- [x] Time ago display
- [x] Author information

## AU Portal Integration
- [x] Account linking flow
- [x] Captcha challenge (image + audio)
- [x] Student profile display
- [x] Exam schedule table
- [x] Results with grades
- [x] Internals marks
- [x] CGPA calculation
- [x] Attendance metrics
- [x] Mock data fallback
- [x] Data caching

## StudyGPT AI
- [x] Chat interface
- [x] Message history
- [x] Markdown rendering
- [x] Code syntax highlighting
- [x] File attachments
- [x] Suggested prompts
- [x] Copy message button
- [x] Regenerate response
- [x] Settings modal
- [x] Loading animation

## Profile & Settings
- [x] Profile information display
- [x] Avatar with initials fallback
- [x] Edit profile modal
- [x] Notification settings
- [x] Theme preferences
- [x] Language selection (placeholder)
- [x] Data export option
- [x] Account deletion option

## Notifications
- [x] Notification center dropdown
- [x] Unread count badge
- [x] Category icons
- [x] Time ago display
- [x] Mark as read
- [x] Mark all as read
- [x] Delete notification
- [x] Clear all button

## UI Components
- [x] Button variants (primary, secondary, danger, ghost, outline, glass)
- [x] Card variants (default, glass, gradient, outline)
- [x] Input with icon and error
- [x] Textarea component
- [x] Select dropdown
- [x] Modal with portal
- [x] Confirm dialog
- [x] Avatar with status
- [x] Avatar group
- [x] Badge variants
- [x] Role badges
- [x] Counter badges
- [x] Stat cards with trends

---

# 8. Recommended Improvements (Frontend Only)

## 8.1 Accessibility Improvements

### Keyboard Navigation
- [x] Add `tabindex` to all interactive elements
- [x] Implement focus trap in modals
- [ ] Add keyboard shortcuts for common actions
- [x] Ensure all dropdowns support arrow key navigation

### Screen Reader Support
- [x] Add `aria-label` to icon-only buttons
- [x] Implement `aria-live` regions for dynamic content
- [x] Add `role` attributes to custom components
- [ ] Ensure meaningful `alt` text for images

### Color Contrast
- [ ] Review `slate-500` text on dark backgrounds
- [ ] Ensure 4.5:1 contrast ratio for body text
- [ ] Add focus indicators that meet WCAG standards

## 8.2 UX Improvements

### Forms & Validation
- [x] Add real-time validation feedback
- [x] Implement form dirty state tracking
- [x] Add unsaved changes warning
- [x] Improve error message clarity

### Loading States
- [x] Add skeleton loaders for content
- [ ] Implement optimistic updates for mutations
- [ ] Add progress indicators for file uploads
- [ ] Show inline loading for buttons

### Empty States
- [x] Design empty state illustrations
- [x] Add helpful CTAs in empty states
- [ ] Provide contextual suggestions

## 8.3 Responsive Improvements

### Mobile Experience
- [x] Implement pull-to-refresh for lists
- [x] Add swipe gestures for navigation
- [x] Create mobile-first modals (bottom sheets)
- [ ] Optimize touch targets (min 44px)

### Tablet Optimization
- [ ] Design tablet-specific layouts
- [ ] Implement split-view for chat
- [ ] Add gesture support for sidebar

## 8.4 Component Structure

### Refactoring Suggestions
- [ ] Extract form components (LoginForm, RegisterForm)
- [ ] Create reusable Table component
- [x] Implement DataGrid with sorting/filtering
- [x] Create Search component with debouncing
- [x] Add Dropdown menu component
- [x] Create Tabs component

### Code Organization
- [ ] Move mock data to `__mocks__` directory
- [x] Create `hooks/` directory for custom hooks
- [x] Separate API calls from components
- [x] Implement proper error boundaries

## 8.5 Performance Improvements

### Bundle Size
- [x] Lazy load page components
- [x] Code-split by route
- [ ] Optimize icon imports (tree-shaking)
- [ ] Review and remove unused dependencies

### Rendering
- [ ] Memoize expensive computations
- [x] Virtualize long lists
- [ ] Optimize re-renders with React.memo
- [x] Implement windowing for tables

## 8.6 File Organization Recommendations

### Current Structure Issues
- `App.css` contains default Vite styles (can be removed)
- Some pages are very large (400+ lines)
- Mock data mixed with component logic

### Suggested Structure
```
src/
├── components/
│   ├── common/        # Shared components
│   ├── forms/         # Form components
│   ├── layout/        # Layout components
│   ├── ui/            # Primitive UI components
│   └── features/      # Feature-specific components
│       ├── attendance/
│       ├── chat/
│       ├── studygpt/
│       └── ...
├── hooks/             # Custom React hooks
├── pages/             # Route components (thin)
├── services/          # API layer
├── store/             # Zustand stores
├── types/             # TypeScript types
├── utils/             # Utility functions
├── constants/         # Constants & config
└── mocks/             # Mock data
```

---

# 9. How to Extend This Frontend

## 9.1 Add a New Page

### Step 1: Create Page Component
```tsx
// src/pages/NewFeature.tsx
import React from 'react';
import { Card } from '@/components/ui/Card';

const NewFeaturePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">New Feature</h1>
      <Card variant="glass">
        {/* Content */}
      </Card>
    </div>
  );
};

export default NewFeaturePage;
```

### Step 2: Add Route
```tsx
// src/App.tsx - Inside DashboardLayout Route
<Route path="/new-feature" element={<NewFeaturePage />} />
```

### Step 3: Add Navigation Item
```tsx
// src/components/layout/Sidebar.tsx - Add to navItems
{
  label: 'New Feature',
  href: '/new-feature',
  icon: <NewIcon className="w-5 h-5" />,
  roles: ['student', 'teacher', 'hod', 'principal'],
}
```

## 9.2 Create a Reusable Data Table Component

```tsx
// src/components/common/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
  }>;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, ...props }: DataTableProps<T>) {
  // Implementation
}
```

## 9.3 Implement Push Notifications UI

```tsx
// Extend NotificationCenter with push subscription
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // Register service worker and subscribe
  }
};
```

## 9.4 Add Chart/Analytics Dashboard

```tsx
// Use Recharts for data visualization
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AttendanceTrendChart = ({ data }) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
    <XAxis dataKey="month" stroke="#94a3b8" />
    <YAxis stroke="#94a3b8" />
    <Tooltip />
    <Line type="monotone" dataKey="attendance" stroke="#06b6d4" />
  </LineChart>
);
```

## 9.5 Implement Offline-First PWA Features

1. **Service Worker**: Configure in `vite.config.ts` with `vite-plugin-pwa`
2. **Cache Strategy**: Cache static assets and API responses
3. **Manifest**: Already configured in `public/manifest.json`
4. **Sync**: Implement background sync for offline actions

---

## Appendix A: Environment Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# AU Portal API
VITE_AU_PORTAL_URL=
```

## Appendix B: Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

*End of Frontend Full Specification*

**Document Version**: 1.0.0  
**Last Updated**: January 12, 2026  
**Generated by**: FrontendArchitect AI

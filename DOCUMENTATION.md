# Admission Management System — Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Installation & Setup](#4-installation--setup)
5. [Environment Variables](#5-environment-variables)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Default Credentials](#7-default-credentials)
8. [Database Schema](#8-database-schema)
9. [API Reference](#9-api-reference)
10. [Frontend Pages](#10-frontend-pages)
11. [Business Rules](#11-business-rules)
12. [Admission Flow](#12-admission-flow)

---

## 1. Project Overview

The Admission Management System is a full-stack web application built with the MERN stack to manage the complete student admission lifecycle — from applicant registration to seat allocation and final admission confirmation.

It supports three user roles with different access levels, enforces strict business rules like no seat overbooking, and generates unique immutable admission numbers.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, Tailwind CSS, Redux Toolkit, Axios, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT (JSON Web Tokens), bcryptjs |
| Charts | Chart.js, react-chartjs-2 |
| Notifications | react-toastify |

---

## 3. Folder Structure

```
admission-management/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js     # Login, getMe
│   │   ├── user.controller.js     # User CRUD (admin only)
│   │   ├── masterSetup.controller.js  # Generic CRUD factory
│   │   ├── quota.controller.js    # Quota management
│   │   ├── applicant.controller.js    # Applicant CRUD
│   │   ├── allocation.controller.js   # Atomic seat allocation
│   │   ├── admission.controller.js    # Admission confirmation
│   │   └── dashboard.controller.js    # Dashboard stats
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT protect + role authorize
│   │   └── validate.middleware.js # express-validator handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Institution.js
│   │   ├── Campus.js
│   │   ├── Department.js
│   │   ├── AcademicYear.js
│   │   ├── Program.js
│   │   ├── Quota.js
│   │   ├── Applicant.js
│   │   ├── Admission.js
│   │   └── Counter.js             # Auto-increment for admission numbers
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── institution.routes.js
│   │   ├── campus.routes.js
│   │   ├── department.routes.js
│   │   ├── program.routes.js
│   │   ├── academicYear.routes.js
│   │   ├── quota.routes.js
│   │   ├── applicant.routes.js
│   │   ├── allocation.routes.js
│   │   ├── admission.routes.js
│   │   └── dashboard.routes.js
│   ├── utils/
│   │   └── seed.js                # Database seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/
        │   └── axios.js           # Axios instance + interceptors
        ├── components/
        │   ├── Layout.js          # Sidebar + main layout
        │   ├── StatCard.js        # Dashboard stat card
        │   ├── Table.js           # Reusable data table
        │   └── Modal.js           # Reusable modal dialog
        ├── pages/
        │   ├── LoginPage.js
        │   ├── DashboardPage.js
        │   ├── ApplicantsPage.js
        │   ├── ApplicantFormPage.js
        │   ├── SeatAllocationPage.js
        │   ├── AdmissionConfirmPage.js
        │   ├── MasterSetupPage.js
        │   ├── UsersPage.js
        │   └── ReportsPage.js
        ├── routes/
        │   └── ProtectedRoute.js  # JWT + role guard
        ├── store/
        │   ├── index.js           # Redux store
        │   └── slices/
        │       ├── authSlice.js
        │       └── applicantSlice.js
        ├── App.js
        ├── index.js
        └── index.css              # Tailwind + custom classes
```

---

## 4. Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env        # fill in your values
node utils/seed.js          # seed dummy data + users
npm run dev                 # starts on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start                   # starts on port 3000
```

---

## 5. Environment Variables

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/admission_management
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 6. User Roles & Permissions

| Feature | Admin | Admission Officer | Management |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| View Reports | ✅ | ❌ | ✅ |
| Master Setup (CRUD) | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Create/Edit Applicants | ✅ | ✅ | ❌ |
| Allocate Seats | ✅ | ✅ | ❌ |
| Confirm Admission | ✅ | ✅ | ❌ |
| Configure Quotas | ✅ | ❌ | ❌ |

---

## 7. Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Admission Officer | officer@example.com | Officer@123 |
| Management | management@example.com | Mgmt@123 |

---

## 8. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | unique, lowercase |
| password | String | bcrypt hashed |
| role | Enum | admin / admission_officer / management |
| isActive | Boolean | default true |

### Institution
| Field | Type |
|---|---|
| name, code | String |
| address, phone, email | String |

### Campus
| Field | Type |
|---|---|
| name, code | String |
| institution | ObjectId → Institution |

### Department
| Field | Type |
|---|---|
| name, code | String |
| campus | ObjectId → Campus |

### AcademicYear
| Field | Type |
|---|---|
| year | String (e.g. "2025-26") |
| startDate, endDate | Date |
| isCurrent | Boolean |

### Program
| Field | Type |
|---|---|
| name, code | String |
| department | ObjectId → Department |
| courseType | Enum: UG / PG |
| entryType | Enum: Regular / Lateral |
| admissionMode | Enum: Government / Management |
| academicYear | ObjectId → AcademicYear |
| totalIntake | Number |

### Quota
| Field | Type | Notes |
|---|---|---|
| program | ObjectId → Program | |
| quotaType | Enum | KCET / COMEDK / Management / Supernumerary |
| totalSeats | Number | |
| allocatedSeats | Number | default 0 |
| remainingSeats | Number | auto-computed on save |

### Applicant
| Field | Type | Notes |
|---|---|---|
| fullName, fatherName | String | |
| email, mobile | String | |
| dob | Date | |
| gender | Enum | Male / Female / Other |
| address | String | |
| category | Enum | General / OBC / SC / ST / EWS |
| entryType | Enum | Regular / Lateral |
| quotaType | Enum | KCET / COMEDK / Management / Supernumerary |
| marks, qualifyingExam | Mixed | |
| programApplied | ObjectId → Program | |
| allotmentNumber | String | government flow |
| documentStatus | Enum | Pending / Submitted / Verified |
| feeStatus | Enum | Pending / Paid |
| seatAllocated | Boolean | default false |
| admissionConfirmed | Boolean | default false |

### Admission
| Field | Type | Notes |
|---|---|---|
| admissionNumber | String | unique, immutable |
| applicant | ObjectId → Applicant | unique |
| program | ObjectId → Program | |
| quota | ObjectId → Quota | |
| academicYear | ObjectId → AcademicYear | |
| confirmedAt | Date | |
| confirmedBy | ObjectId → User | |

---

## 9. API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Protected | Get current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/users | Admin | List all users |
| POST | /api/users | Admin | Create user |
| PUT | /api/users/:id | Admin | Update user |
| DELETE | /api/users/:id | Admin | Deactivate user |

### Master Setup (Institutions / Campuses / Departments / Programs / Academic Years)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/{resource} | Protected | List with optional ?search= |
| GET | /api/{resource}/:id | Protected | Get single record |
| POST | /api/{resource} | Admin | Create |
| PUT | /api/{resource}/:id | Admin | Update |
| DELETE | /api/{resource}/:id | Admin | Soft delete |

### Quotas
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/quotas/:programId | Protected | Get quotas for a program |
| POST | /api/quotas | Admin | Save/update quota matrix |

### Applicants
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/applicants | Protected | List with ?search= ?quotaType= ?programApplied= |
| GET | /api/applicants/:id | Protected | Get single applicant |
| POST | /api/applicants | Admin / Officer | Create applicant |
| PUT | /api/applicants/:id | Admin / Officer | Update applicant |
| DELETE | /api/applicants/:id | Admin / Officer | Delete applicant |

### Seat Allocation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/allocate-seat | Admin / Officer | Atomically allocate seat |

Request body:
```json
{
  "applicantId": "<id>",
  "quotaId": "<id>",
  "allotmentNumber": "KCET25001"
}
```

### Admission Confirmation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/confirm-admission | Protected | List confirmed admissions |
| POST | /api/confirm-admission | Admin / Officer | Confirm admission |

Request body:
```json
{ "applicantId": "<id>" }
```

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/dashboard | Protected | All stats and chart data |

---

## 10. Frontend Pages

| Page | Route | Roles | Description |
|---|---|---|---|
| Login | /login | Public | JWT login form |
| Dashboard | /dashboard | All | Stats cards + charts |
| Applicants | /applicants | Admin, Officer | List with search/filter |
| New/Edit Applicant | /applicants/new, /applicants/:id/edit | Admin, Officer | 15-field form |
| Seat Allocation | /seat-allocation | Admin, Officer | Allocate seat with quota check |
| Admission Confirm | /admission-confirm | Admin, Officer | Confirm + view confirmed list |
| Master Setup | /master-setup | Admin | Tabbed CRUD for all master data |
| Users | /users | Admin | Create and manage users |
| Reports | /reports | Admin, Management | Full admission records table |

---

## 11. Business Rules

1. **No seat overbooking** — seat allocation uses MongoDB transactions; if quota is full it returns `"Seat not available for selected quota"`

2. **Quota seats ≤ program intake** — saving a quota matrix that exceeds total intake is blocked at the API level

3. **Admission confirmation requires all three:**
   - Seat allocated
   - Document status = Verified
   - Fee status = Paid

4. **Admission number is generated once and immutable** — format: `PROGRAM_CODE/YEAR/COURSE_TYPE/QUOTA_TYPE/0001`

5. **Confirmed admission records cannot be updated** — Mongoose pre-hook blocks `findOneAndUpdate` on the Admission model

6. **Remaining seats auto-update** — `remainingSeats` is recomputed on every Quota save via pre-save hook

---

## 12. Admission Flow

### Government Quota Flow
```
Create Applicant
      ↓
Enter Allotment Number (KCET/COMEDK)
      ↓
Select Quota → Check Seat Availability
      ↓
Lock Seat (atomic transaction)
      ↓
Verify Documents → Mark Fee Paid
      ↓
Confirm Admission → Generate Admission Number
```

### Management Quota Flow
```
Create Applicant (manual)
      ↓
Select Program → Select Management Quota
      ↓
Allocate Seat
      ↓
Verify Documents → Mark Fee Paid
      ↓
Confirm Admission → Generate Admission Number
```

### Admission Number Format
```
BE-CSE/2026/UG/KCET/0001
BE-CSE/2026/UG/KCET/0002
MT-CSE/2026/PG/Management/0001
```
Each combination of program + year + quota type has its own auto-incrementing sequence stored in the `Counter` collection.

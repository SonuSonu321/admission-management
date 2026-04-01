# Admission Management System — MERN Stack

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm install
node utils/seed.js          # creates admin@example.com / Admin@123
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## Default Login
- Email: `admin@example.com`
- Password: `Admin@123`

## Roles
| Role | Access |
|------|--------|
| admin | Full access |
| admission_officer | Applicants, Seat Allocation, Admission Confirm |
| management | Dashboard + Reports (view only) |

## Key Business Rules Enforced
- Atomic seat allocation with MongoDB transactions (no overbooking)
- Quota seats cannot exceed program intake
- Admission confirmation requires: seat allocated + documents verified + fee paid
- Admission number is auto-generated once and immutable
- Confirmed admission records cannot be updated

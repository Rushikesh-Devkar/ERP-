# 🏫 School ERP System

Simple, beginner-friendly School ERP built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS.

## 🚀 Quick Start

### 1. Prerequisites
```
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
```

### 2. Setup & Seed Demo Users (ONE COMMAND!)
```bash
cd "C:\Users\ANIL\Desktop\school-erp"
npm run seed   # ← Creates all demo users automatically!
npm install
npm run dev
```

**MongoDB**: Install OR use MongoDB Atlas (free cloud DB)**

Backend runs on `http://localhost:5000`

### 4. Start Frontend
```bash
# Open in browser
C:\Users\ANIL\Desktop\school-erp\frontend\index.html
```

## 👥 Demo Users (Auto-created on first use)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin123@gmail.com | admin123 |
| Student | student123@gmail.com | student123 |
| Teacher | teacher123@gmail.com | teacher123 |
| Principal | principal@gmail.com | principal123 |

## 📁 Project Structure
```
school-erp/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── controllers/  # Business logic
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth middleware
│   └── server.js     # Main server
├── frontend/         # Static HTML/JS
└── package.json
```

## 🔐 Features by Role
**Admin**: Add students/staff, view lists
**Student**: View profile, attendance, marks, fees, apply leave/documents
**Staff**: Mark attendance, upload marks, view students/leaves
**Principal**: Reports, approve leaves

## 🛠 Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Auth**: JWT, bcrypt
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)

## 📱 API Endpoints
```
POST /api/auth/login
POST /api/admin/students
POST /api/students/leave
...
```

## 🎉 Ready to use!
1. Start MongoDB
2. `npm install` in backend
3. `npm run dev` 
4. Open `frontend/index.html`
5. Login with demo credentials

**That's it!** Full ERP system ready ✅


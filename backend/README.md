# Tests&Funnels MERN Backend & Leads Dashboard

A complete **MERN Stack** (MongoDB, Express, React, Node.js) backend system and leads management CRM for **tests&funnels**.

---

## 🏗️ Architecture

```
backend/
├── config/
│   └── db.js               # MongoDB connection (with local fallback buffer)
├── controllers/
│   ├── authController.js   # JWT authentication & session verification
│   └── leadController.js   # Lead submission, listing, filtering, updates, CSV export
├── middleware/
│   └── auth.js             # JWT bearer verification middleware
├── models/
│   └── Lead.js             # Mongoose Lead Schema (Name, Phone, Email, Ad Spend, Status, etc.)
├── routes/
│   ├── authRoutes.js       # /api/auth endpoints (login, verify)
│   └── leadRoutes.js       # /api/leads endpoints (submit, stats, update, delete, export)
├── public/
│   └── dashboard/          # React 18 SPA Leads Dashboard UI (JSX, Hooks, Real-time state)
│       └── index.html
├── .env.example            # Environment variables template
├── .env                    # Active environment variables
├── package.json            # Node.js dependencies (express, mongoose, cors, jsonwebtoken, etc.)
├── server.js               # Express application server
└── README.md               # Documentation
```

---

## ⚡ Key Features

- **🍃 MongoDB + Mongoose ODM:** Schema-enforced lead documents with timestamps, contact validation, status tracking, and source page analytics.
- **⚡ Express REST API:**
  - `POST /api/leads/submit` (Public): Receives leads from all frontend forms.
  - `GET /api/leads` (Protected): Search, filter, and paginate incoming leads.
  - `GET /api/leads/stats` (Protected): Real-time metrics (Total, New, Today, Converted).
  - `PUT /api/leads/:id` (Protected): Update status (`New` ➔ `Contacted` ➔ `In Discussion` ➔ `Converted` ➔ `Closed`) & team notes.
  - `DELETE /api/leads/:id` (Protected): Remove lead.
  - `GET /api/leads/export` (Protected): 1-click UTF-8 CSV export for Excel / CRM.
- **⚛️ React Dashboard UI:**
  - Modern dark-themed dashboard at `/backend/` or `/dashboard`.
  - State-driven React components with live filtering and instant search.
  - Direct WhatsApp & Call action links for every lead.
  - Full details drawer with note logging.
- **🔐 JWT Authentication:**
  - Protected admin routes using JSON Web Tokens.
  - Default credentials: `admin` / `admin@tandf2026`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment (`.env`)
Edit `backend/.env`:
```env
PORT=5000
# For local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/testsandfunnels
# Or for MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/testsandfunnels

JWT_SECRET=tandf_super_secret_jwt_key_2026_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@tandf2026
```

### 3. Run the Server
```bash
# From the project root:
node backend/server.js

# Or with automatic reload during development:
npm run dev --prefix backend
```

Once started:
- **Website:** [http://localhost:5000/](http://localhost:5000/)
- **React Leads Dashboard:** [http://localhost:5000/backend/](http://localhost:5000/backend/)
- **API Status:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

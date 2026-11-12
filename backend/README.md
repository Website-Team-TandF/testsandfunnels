# tests&funnels Backend & Leads Management System

This `backend/` folder provides a complete, lightweight, production-ready lead handling system and dashboard for **tests&funnels**.

---

## 📁 Folder Structure

```
backend/
├── api/
│   ├── submit.php       # Public endpoint: receives frontend form submissions (POST JSON)
│   ├── leads.php        # Authenticated endpoint: returns list of leads with search & filter
│   ├── update.php       # Authenticated endpoint: updates lead status and internal admin notes
│   ├── delete.php       # Authenticated endpoint: deletes a lead record
│   └── export.php       # Authenticated endpoint: one-click CSV export of all leads
├── data/
│   ├── .htaccess        # Blocks direct public access/download of leads data
│   └── leads.json       # Fast JSON storage for lead records
├── config.php           # Admin credentials, session handling & helper functions
├── index.php            # Production Leads Dashboard (PHP for Apache / cPanel / Shared Hosting)
├── dashboard.html       # Local dev Leads Dashboard (used when testing via Node.js)
├── server.js            # Zero-dependency local Node.js test server
└── README.md            # Documentation (this file)
```

---

## 🔐 Admin Dashboard Credentials

- **URL:** `https://your-domain.com/backend/` (or `http://localhost:3000/backend/` locally)
- **Username:** `admin`
- **Password:** `admin@tandf2026`

*(To change credentials, edit `backend/config.php`)*.

---

## ⚡ How It Works with Frontend Forms

The tests&funnels frontend forms already have a built-in `fetch` handler:
```javascript
window.TF = {
  "formEndpoint": "/backend/api/submit.php",
  ...
};
```

When a visitor submits any form on the website (Contact, Free Business Audit, etc.):
1. The form sends a POST request with the user's data (`name`, `email`, `phone`, `industry`, `monthly_ad_spend`, `message`, etc.) to `/backend/api/submit.php`.
2. The backend stores the lead in `backend/data/leads.json` with a unique ID, client IP, source page, and status set to `New`.
3. The lead immediately appears in the **Leads Dashboard**.
4. You can:
   - View complete details.
   - Click to **Call** or **WhatsApp** the client directly with a prefilled greeting.
   - Update status: `New` ➔ `Contacted` ➔ `In Discussion` ➔ `Converted` ➔ `Closed`.
   - Add team notes (e.g., "Quoted ₹1.5L package on 12th Nov").
   - Export all leads to Excel/CSV with 1 click.

---

## 🚀 How to Run Locally

Since Node.js is already installed on your machine, you can test everything locally right now:

```bash
node backend/server.js
```
Then open:
- Website: [http://localhost:3000/](http://localhost:3000/)
- Leads Dashboard: [http://localhost:3000/backend/](http://localhost:3000/backend/)

---

## 🌐 How to Deploy to Production (FTP / GitHub)

- **Via Git:** Commit and push the `backend/` folder (`git add backend && git commit -m "Add backend leads system" && git push`).
- **Via FTP:** Upload the `backend/` folder directly to your hosting directory (e.g. `public_html/`).
- On any Apache / cPanel / PHP hosting, `backend/index.php` and `backend/api/submit.php` will work immediately out of the box with zero configuration!

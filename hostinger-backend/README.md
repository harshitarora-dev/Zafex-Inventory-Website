# Zafex Collectibles - Backend (Hostinger Ready)

Yeh folder Zafex Collectibles ka complete, standalone Express.js backend hai jo Hostinger VPS / Cloud / Shared Node.js hosting aur local MySQL dono ke liye ready hai.

---

## 📁 Files Overview

| File / Folder | Purpose |
|---|---|
| `index.mjs` | Main compiled Express server with all routes & middlewares |
| `package.json` | Minimal production dependencies (`mysql2`) |
| `.env.example` | Environment variable template (Database, Session, Razorpay) |
| `zafex_database.sql` | Complete MySQL schema + Seed products (phpMyAdmin import) |
| `public/images/` | Product & Homepage images storage for static serving |

---

## 🚀 How to Run Locally (Local MySQL Test)

1. **MySQL Database Setup**:
   - Make sure MySQL is running locally (e.g. XAMPP, WampServer, Docker, or MySQL Workbench).
   - Create a database: `CREATE DATABASE zafex_db;`
   - (Optional) Import `zafex_database.sql` via phpMyAdmin or command line:
     ```bash
     mysql -u root -p zafex_db < zafex_database.sql
     ```
     *(Note: If you don't import manually, the server will auto-create all tables on startup).*

2. **Configure `.env`**:
   - Copy `.env.example` to `.env`:
     ```env
     PORT=8080
     NODE_ENV=development
     DATABASE_URL=mysql://root:@localhost:3306/zafex_db
     SESSION_SECRET=local-development-secret-12345
     ADMIN_PASSWORD=admin
     RAZORPAY_KEY_ID=rzp_test_xxxxxxx
     RAZORPAY_KEY_SECRET=xxxxxxx
     ```

3. **Install & Run**:
   ```bash
   npm install
   npm start
   ```
   Server will start at `http://localhost:8080`.

---

## 🌐 Hostinger Deployment Guide (Step-by-Step)

### Step 1: Create MySQL Database on Hostinger
1. Log in to **Hostinger hPanel**.
2. Go to **Databases** -> **MySQL Databases**.
3. Create a new database:
   - Database Name: e.g. `u123456789_zafex_db`
   - Username: e.g. `u123456789_zafex`
   - Password: *[Set a strong password]*
4. Click **Enter phpMyAdmin** next to your newly created database.
5. In phpMyAdmin, click the **Import** tab at the top.
6. Choose `zafex_database.sql` from your computer and click **Go / Import**. All 9 tables and default product catalogue will be imported!

---

### Step 2: Setup Node.js Application on Hostinger
1. In **Hostinger hPanel**, go to **Websites** -> click **Manage** -> search **Node.js** (or "Node.js Application").
2. Click **Create Application** / **Add Application**:
   - **Node.js Version**: Select `18.x`, `20.x`, or `22.x` (Recommended: Node 20.x).
   - **Application Mode**: `Production`
   - **Application Root**: Select the folder where you will upload the backend files (e.g. `public_html/backend` or `domains/zafexcollectibles.com/backend` or `backend`).
   - **Application Startup File**: `index.mjs`
   - **Application URL**: Select domain or subdomain (e.g. `zafexcollectibles.com` or `api.zafexcollectibles.com` or `/api`).
3. Click **Create** / **Save**.

---

### Step 3: Upload Backend Files via File Manager
1. In Hostinger hPanel, open **File Manager**.
2. Open the folder you chose as Application Root (e.g. `backend` or `public_html/backend`).
3. Upload all files from this `hostinger-backend` folder:
   - `index.mjs`
   - `package.json`
   - `pino-worker.mjs`, `pino-file.mjs`, `pino-pretty.mjs`, `thread-stream-worker.mjs`
   - `public/` directory (with images)
   - `zafex_database.sql`
4. Create `.env` file in that folder (or add Environment variables in Hostinger Node.js app settings):
   ```env
   PORT=8080
   NODE_ENV=production
   DATABASE_URL=mysql://u123456789_zafex:YourDbPassword@localhost:3306/u123456789_zafex_db
   SESSION_SECRET=your-random-production-secret-98765
   COOKIE_SECURE=false
   ADMIN_PASSWORD=your_secure_admin_password
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```

---

### Step 4: Install Dependencies & Start Server
1. In the Hostinger Node.js App manager page, click **NPM Install** (or run `npm install` via SSH/Terminal).
2. Click **Restart Application** / **Start**.
3. Visit `https://your-domain.com/api/health` — it will return:
   ```json
   {"status":"ok"}
   ```

---

## 🛍️ Supported Features in Backend

1. **Authentication**:
   - `/api/auth/register` (Register customer with bcrypt password hashing)
   - `/api/auth/login` (Login with rememberMe support)
   - `/api/auth/logout` (Destroys session & clears cookie)
   - `/api/auth/me` (Current user profile)
   - `/api/auth/profile` (Update name, email, phone, avatar)
   - `/api/auth/password` (Change password with verification)

2. **Products Catalogue**:
   - `/api/products` (Filter by `cat`, `sub`, `badge`, `inStock`, `q`, `sort`, `page`, `limit`)
   - `/api/products/search?q=...` (Live search)
   - `/api/products/:id` (Single product details)

3. **Cart & Wishlist**:
   - `/api/cart` (GET, POST add item, PUT update quantity, DELETE remove item, DELETE clear)
   - `/api/wishlist` (GET, POST add item, DELETE remove item)

4. **Orders & Checkout**:
   - `/api/orders/checkout` (Supports both `paymentMethod: 'cod'` and `'razorpay'`)
   - `/api/orders` (User orders list)
   - `/api/orders/:id` (Order details + line items + status history)
   - `/api/orders/:id/cancel` (Cancel pending orders)

5. **Payment Gateway (Razorpay)**:
   - `/api/payment/create-order` (Creates Razorpay order in INR paise)
   - `/api/payment/verify` (HMAC SHA256 signature verification & marks order paid)

6. **Customer Reviews**:
   - `/api/products/:productId/reviews` (GET list with average rating & count, POST review)
   - `/api/reviews/:id` (PUT edit review, DELETE review)

7. **Contact / Inquiries**:
   - `/api/contact` (Submit message / custom inquiry)

8. **Admin Panel**:
   - `/api/admin/login` (Admin login with `ADMIN_PASSWORD`)
   - `/api/admin/me` (Admin auth check)
   - `/api/admin/dashboard` (Stats: Total users, orders, revenue, pending, low-stock)
   - `/api/admin/products` (List, Create with image upload via multer, Update, Delete)
   - `/api/admin/orders` (List all customer orders, View details, Update order status)
   - `/api/admin/customers` (List registered users)
   - `/api/admin/contacts` (List inquiries)
   - `/api/admin/homepage-images` (View & replace homepage banner/category images)

# 🍔 Foodie – Frontend

This is the **frontend** of the **Foodie Food Delivery App**, built using **React + Vite + Redux Toolkit + Tailwind CSS**.  
It connects to the Foodie backend API to provide user authentication, menu browsing, cart management, checkout with Razorpay payment, order tracking, and admin dashboard access.

---

# 🚀 Features

### ✅ User Features
- User Registration & Login (JWT Authentication)
- Browse food menu with category filter
- Add / Remove items from cart
- Persistent cart from database
- Checkout with Razorpay payment gateway
- View order history
- Track order details
- Mobile responsive UI

---

### ✅ Admin Features
- Admin dashboard
- Create / update / delete menu items
- Manage orders and update status
- View all customer orders

---

---

# 🛠 Tech Stack

- **React 18**
- **Vite**
- **Redux Toolkit** – state management
- **React Router DOM** – routing
- **Axios** – API calls
- **Tailwind CSS** – styling

---

---

# 📁 Folder Structure

frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
├── main.jsx
├── App.jsx
├── index.css
├── components/
│ └── Layout/
│ └── Navbar.jsx
├── pages/
│ ├── Home.jsx
│ ├── Menu.jsx
│ ├── Cart.jsx
│ ├── Checkout.jsx
│ ├── Orders.jsx
│ ├── OrderDetails.jsx
│ └── Auth/
│ ├── Login.jsx
│ └── Register.jsx
├── store/
│ ├── store.js
│ └── slices/
│ ├── authSlice.js
│ ├── menuSlice.js
│ └── cartSlice.js
└── utils/
└── ProtectedRoute.jsx

yaml
Copy code

---

---

# ⚙️ Installation & Setup

---

## Step 1 – Install frontend dependencies

```bash
cd frontend
npm install
Step 2 – Run development server
bash
Copy code
npm run dev
Server runs at:

arduino
Copy code
http://localhost:3000
Step 3 – Ensure Backend is Running
Your backend server must be running at:

arduino
Copy code
http://localhost:5000
The frontend uses Vite proxy to connect API:

js
Copy code
proxy: {
   '/api': 'http://localhost:5000'
}
✅ No .env needed for frontend if proxy is used.

🔑 Authentication Flow
Users login/register through backend

JWT token is saved to localStorage

Redux stores login session

Protected routes:

/cart

/checkout

/orders

/orders/:id

/admin/*

If token is missing → redirect to login page.

🛒 Cart & Redux
Redux Toolkit manages application state:

authSlice → login/logout, user session

menuSlice → fetch food menu items

cartSlice → manage cart items

Cart updates:

Add items

Remove items

Change quantity

Auto total calculation

💳 Payments
Checkout uses Razorpay:

Flow:
sql
Copy code
Frontend ➜ Create Order API ➜ Razorpay widget ➜ Payment Verify API ➜ Order stored
APIs used:
bash
Copy code
POST /api/orders/create
POST /api/orders/verify
🔒 Route Protection
ProtectedRoute.jsx checks authentication:

If token exists → continue

If not logged in → redirect to /login

This protects sensitive pages like Cart & Orders.

📦 Build for Production
Create optimized production build:

bash
Copy code
npm run build
Build output:

Copy code
dist/
Preview build locally:
bash
Copy code
npm run preview
🌐 Free Deployment
You can deploy frontend FREE on:

✅ Vercel

✅ Netlify

✅ Firebase Hosting

Deploy Steps:
Push code to GitHub

Open platform (ex: Vercel)

Import repo

Set build command:

arduino
Copy code
npm run build
Set output directory:

nginx
Copy code
dist
Deploy 🚀

🐛 Common Errors
API Not Working?
✅ Ensure backend server is running on port 5000
✅ Check proxy config in vite.config.js

Login Not Redirecting?
✅ Clear localStorage
✅ Re-login user
✅ Verify backend JWT secret

Tailwind styles not loading?
✅ Restart dev server
✅ Check Tailwind plugin installation

❤️ Credits
Made with ❤️ using:

React + Redux + Vite + Tailwind

Frontend for MERN Food Delivery App — Foodie 🍔

yaml
Copy code

---

✅ This is the **complete frontend README file** exactly as you asked.

---

If you'd like next, I can also give:

✅ **Full Backend README**  
✅ **Deployment Step-by-step guide with screenshots**  
✅ **Complete project PPT (presentation)**  
✅ **ER diagram + flowcharts PDF**

Just tell me what you want 🙂

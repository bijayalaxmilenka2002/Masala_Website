# 🌿 Subhadarshini Spices — Official Web Platform & Owner Portal

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://masala-website-flax.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Masala_Website-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/bijayalaxmilenka2002/Masala_Website)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

> **"The Soul of Every Indian Kitchen"** — Modern, high-performance web storefront, interactive spice catalog, WhatsApp ordering engine, and private inquiry management portal for **Subhadarshini Agro Pvt Ltd**, rooted in the culinary heritage of Odisha.

---

## 🌐 Live Deployment Links

| Resource | URL | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Customer Storefront** | [masala-website-flax.vercel.app](https://masala-website-flax.vercel.app/) | **Public** | Full spice showcase, dynamic pack pricing, recipes, company story & direct WhatsApp ordering. |
| **Owner Inquiries Portal** | [masala-website-flax.vercel.app/inquiries.html](https://masala-website-flax.vercel.app/inquiries.html) | **Protected** | Secure dashboard for viewing customer inquiries, wholesale leads, and exporting data to CSV. |
| **Owner Login** | [masala-website-flax.vercel.app/owner-login.html](https://masala-website-flax.vercel.app/owner-login.html) | **Private** | Authentication gate with session token management and credential updates. |

---

## ✨ Key Features

### 🛒 Customer Experience & Storefront
- **Dynamic Pack Size & Pricing Engine**: Customers can switch between pack sizes (50g, 100g, 250g, 500g) with live price updates (e.g. Sambar Masala ₹38 for 50g, ₹72 for 100g).
- **Interactive Quick-View Modal**: View high-resolution product imagery, health & nutritional benefits, authentic ingredients list, and custom weights.
- **Direct WhatsApp Ordering**: Automatically constructs pre-filled WhatsApp messages with the selected spice name, weight, and price for 1-click orders to customer care (+91 6372585804).
- **Multi-Category Navigation**: Filter across Blended Masalas, Pure Ground Powders, Whole Khada Spices, and Premium Soya Chunks.
- **Rich Content & Pages**:
  - `index.html` — Hero showcase, featured products, category highlights, why choose us, customer testimonials.
  - `products.html` — Full catalog with real-time category filtering and search.
  - `about.html` — Brand heritage, hygiene standards, founder vision, and factory photos.
  - `recipes.html` — Authentic Odia & Indian dishes with spice pairings.
  - `team.html` — Leadership and plant operations team.
  - `gallery.html` — Processing plant, cleaning, grinding, and automated packaging gallery.
  - `contact.html` — Interactive inquiry form with live backend submission.

---

### 🔒 Private Owner Portal & Security
- **Strict Access Control**: Unauthenticated requests to `/inquiries.html` are automatically blocked and redirected to `/owner-login.html`.
- **Session-Based Authentication**: Secure cookie authentication with persistent credentials.
- **Live Inquiries Dashboard**: Real-time table displaying customer inquiries, wholesale distributor leads, and product feedback.
- **One-Click WhatsApp Follow-up**: Click any customer's phone number directly from the dashboard to initiate a WhatsApp chat with their inquiry pre-filled.
- **Export to CSV**: Download complete inquiry logs for sales, CRM, and distribution pipelines.
- **Credential Management**: Built-in modal allowing the owner to securely change their username and password directly from the dashboard.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom Design System, Modern Typography, Glassmorphism, Micro-animations), Vanilla JavaScript (ES6+ modules).
- **Backend & Serverless**:
  - **Local Development**: Built-in zero-dependency native Node.js HTTP server (`dev-server.js`).
  - **Production Hosting**: Vercel Serverless Edge Architecture (`api/*.js`).
- **Typography & Icons**: Plus Jakarta Sans, Google Fonts, FontAwesome 6 Pro icons.
- **Data Persistence**: JSON-based persistent storage (`data/inquiries.json`, `data/admin-config.json`) with `/tmp` support in serverless environments.

---

## 📂 Project Structure

```bash
Masala_Website/
├── api/                           # Vercel Serverless API Handlers
│   ├── _config.js                 # Shared storage, session & auth helpers
│   ├── contact.js                 # POST /api/contact (Receives customer messages)
│   ├── inquiries.js               # GET /api/inquiries (Owner protected endpoint)
│   └── owner/
│       ├── login.js               # POST /api/owner/login
│       ├── logout.js              # POST /api/owner/logout
│       └── change-credentials.js  # POST /api/owner/change-credentials
├── assets/
│   ├── css/
│   │   └── style.css              # Core design tokens, layout & responsive UI
│   ├── js/
│   │   ├── main.js                # UI interactivity, modals, WhatsApp links
│   │   └── products-data.js       # Master spice catalog with packs & pricing
│   └── images/                    # Product shots, banners, factory, and logos
├── data/                          # Local data storage (Git ignored)
│   ├── inquiries.json
│   └── admin-config.json
├── dev-server.js                  # Native Node.js server for local development
├── index.html                     # Home page
├── products.html                  # Spice catalog page
├── about.html                     # Company story & heritage
├── contact.html                   # Contact & distributor inquiry page
├── recipes.html                   # Odia cuisine recipes
├── team.html                      # Company leadership
├── gallery.html                   # Factory & manufacturing gallery
├── owner-login.html               # Owner portal login page
├── inquiries.html                 # Private owner dashboard
├── vercel.json                    # Vercel caching & routing configuration
└── package.json                   # Project metadata & npm scripts
```

---

## 🚀 Local Development Setup

No heavy external dependencies or build steps required. You only need [Node.js](https://nodejs.org/) installed:

1. **Clone the repository:**
   ```bash
   git clone git@github.com:bijayalaxmilenka2002/Masala_Website.git
   cd Masala_Website
   ```

2. **Start the local server:**
   ```bash
   npm run dev
   # or
   node dev-server.js
   ```

3. **Open in browser:**
   - Public Website: `http://localhost:3000`
   - Owner Portal: `http://localhost:3000/inquiries.html`

---

## 🔐 Owner Portal Credentials

- **Default Username:** `admin`
- **Default Password:** `Subhadarshini@2026`

*To update your login credentials, either use the **Change Password** button in the Owner Portal navigation bar, or configure the `OWNER_USER` and `OWNER_PASS` environment variables in your Vercel Project Settings.*

---

## 🏭 About Subhadarshini Agro Pvt Ltd

Founded in 2024, **Subhadarshini Agro Pvt Ltd** is committed to producing 100% pure, unadulterated spices processed in state-of-the-art facilities in Odisha.

- **Head Office:** N3/394, IRC Village, Nayapalli, Bhubaneswar - 751015, Odisha
- **Processing Plant:** Plot No. 1538 & 1537, Sendapur, Godisahi, Cuttack - 754005, Odisha
- **Customer Care & WhatsApp:** [+91 6372585804](https://wa.me/916372585804)
- **Official Email:** care@subhadarshini.com
- **Instagram:** [@subhadarshini_masala](https://www.instagram.com/subhadarshini_masala)
- **Facebook:** [Subhadarshini Spices](https://www.facebook.com/share/1WhNgr9c6m/)

---

&copy; 2024–2026 Subhadarshini Agro Pvt Ltd. All rights reserved. Crafted with purity in Odisha.

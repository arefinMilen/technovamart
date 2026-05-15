# 🛒 TechNova Mart

> Bangladesh’s best gadget and electronics eCommerce platform

**Stack:** Next.js 14 + Django REST Framework + PostgreSQL + Docker

---

## 📁 Project Structure

```
technovamart/
├── frontend/          # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/       # Pages (homepage, products, cart, checkout, auth)
│   │   ├── components/ # UI components (Header, Footer, ProductCard, etc.)
│   │   ├── lib/       # API client (axios)
│   │   ├── store/     # Zustand (auth + cart state)
│   │   └── types/     # TypeScript types
│   └── Dockerfile
│
├── backend/           # Django REST Framework
│   ├── config/        # Settings, URLs, WSGI
│   ├── apps/
│   │   ├── accounts/  # User auth, JWT, Address
│   │   ├── catalog/   # Product, Category, Brand, Banner
│   │   ├── orders/    # Order, OrderItem
│   │   └── payments/  # Payment, bKash/Nagad integration
│   └── Dockerfile
│
├── docker/            # Nginx config
└── docker-compose.yml
```

---

## 🚀 Local Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Step 1: Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Frontend
cp frontend/.env.example frontend/.env.local
```

### Step 2: Run with Docker (Recommended)

```bash
docker-compose up --build
```

This starts:
- 🐘 PostgreSQL at `localhost:5432`
- 🐍 Django API at `http://localhost:8000`
- ⚛️  Next.js at `http://localhost:3000`
- 🌐 Nginx proxy at `http://localhost:80`

### Step 3: Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Step 4: Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin |
| API Root | http://localhost:8000/api |

---

## 🔧 Manual Local Setup (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Set DATABASE_URL to your local PostgreSQL or use SQLite default

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user|
| POST | `/api/auth/login` | JWT Login |
| POST | `/api/auth/logout` | Logout (token blacklist) |
| POST | `/api/auth/refresh` | Access token Refresh |
| GET/PATCH | `/api/auth/profile` | View or update profile |

### Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | All categories|
| GET | `/api/brands` | All brands |
| GET | `/api/products?search=&category=&brand=&min_price=&max_price=` | Product list + filters |
| GET | `/api/products/{slug}` | Product details |
| GET | `/api/banners?position=hero` | Banners |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/preview` |Order preview |
| POST | `/api/orders/create` |Create a new order |
| GET | `/api/orders/me` |My orders |
| GET | `/api/orders/{id}` | Order details |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/init` | Start payment: bKash, Nagad, Card, or COD |
| GET | `/api/payments/callback/bkash` | bKash callback |

---

## 💳 Payment Integration

### bKash (Sandbox)
1. [bKash Developer Portal](https://developer.bka.sh/) Create an account on
2.Collect sandbox credentials
3. `.env` Add them to:
```env
BKASH_APP_KEY=your_key
BKASH_APP_SECRET=your_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
```

### Nagad
1. Contact [Nagad Developer](https://nagad.com.bd/developer/)
2. Collect merchant credentials

---

## 🌍 Production Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### Backend → Render/Railway

1. Push the project to GitHub
2. Create a new Web Service on Render.com
3. Set environment variables
4. Add a PostgreSQL database

### Backend → AWS EC2
```bash
# On server
git clone your-repo
cd technovamart
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🗄️ Database Schema

```
User ─────────── Address
  │
  └── Order ──── OrderItem ── Product ── Category
        │                         │       Brand
        └── Payment               └── ProductImage
                                  └── Banner
```

---

## 🎨 Features

- ✅ JWT Authentication (login/register/refresh)
- ✅ Product catalog with search & filters
- ✅ Shopping cart (Zustand + localStorage)
- ✅ Checkout flow
- ✅ bKash payment integration
- ✅ Nagad payment (placeholder)
- ✅ Cash on Delivery
- ✅ Order management
- ✅ Admin dashboard (Django Admin)
- ✅ Responsive design (mobile-first)
- ✅ Bengali UI
- ✅ Docker deployment

---

## 📞 Support

**TechNova Mart** | Made in Bangladesh 🇧🇩

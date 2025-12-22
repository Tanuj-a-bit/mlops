# ShopMLOps: End-to-End E-commerce with ML Recommendation System

ShopMLOps is a high-performance e-commerce platform integrated with Machine Learning Operations (MLOps). It features real-time product recommendations, advanced search, and a modern microservices-ready architecture.

---

## 🚀 How It Works

1.  **Data Generation**: A synthetic engine generates thousands of realistic products, categories, and user events (views, cart adds, transactions).
2.  **Infrastructure**: Docker launches a suite of services:
    *   **PostgreSQL**: Handles core transactions (Users, Orders).
    *   **MongoDB**: Stores event logs for ML training.
    *   **Elasticsearch**: Provides lightning-fast full-text search.
    *   **Redis**: Caches recommendations and sessions.
3.  **ML Engine**: A Python service computes **TF-IDF Vectorization** and **Cosine Similarity** to suggest products based on item attributes and user behavior.
4.  **Frontend**: A Next.js 14 application provides a seamless, responsive UI with real-time updates.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your system:
*   **Docker & Docker Compose** (Required for database services)
*   **Node.js (v18 or higher)**
*   **Python (3.10 or higher)**
*   **Git**

---

## 🚦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Tanuj-a-bit/mlops.git
cd mlops
```

### 2. Database & Infrastructure (Docker)
This is universal for **Windows (WSL2/Desktop)**, **macOS**, and **Linux**.
```bash
cd Backend
docker-compose up -d
```
*Wait for all containers (Postgres, Mongo, Redis, Elasticsearch) to show "Started".*

### 3. Backend Setup (Python)

#### 🪟 Windows
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

#### 🍎 macOS / 🐧 Linux
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Data Generation & Seeding
Populate the system with products and events:
```bash
# Run from the root directory
python generate_data.py

# Seed the database
cd Backend
npx prisma generate
DATABASE_URL="your_postgresql_url" npx tsx prisma/seed.ts
```

### 5. Frontend Setup (Next.js)

```bash
cd ../Frontend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## 💻 Cross-Platform Guide

| Feature | Windows (PowerShell) | macOS / Linux (Terminal) |
| :--- | :--- | :--- |
| **Python Command** | `python` | `python3` |
| **Virtual Env** | `.\venv\Scripts\activate` | `source venv/bin/activate` |
| **Env Variables** | `$env:DATABASE_URL="url"` | `export DATABASE_URL="url"` |
| **File Paths** | Uses backslashes `\` | Uses forward slashes `/` |

---

## 🤖 Testing the ML Engine

You can manually trigger the recommendation engine from the CLI:

```bash
# Content-based (Item-to-Item)
python ml/recommend.py item 1001

# Collaborative (User-to-Item)
python ml/recommend.py user 5
```

---

## 📜 Project Structure

```bash
├── Backend/          # FastAPI, Prisma, Docker, Database Schemas
├── Frontend/         # Next.js 14, Tailwind CSS, UI Components
├── Dataset/          # Generated CSV data
├── ml/               # Recommendation system logic
└── generate_data.py  # Synthetic data engine
```

---

## 📝 License
MIT License. Created by [Tanuj](https://github.com/Tanuj-a-bit).

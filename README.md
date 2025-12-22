# ShopMLOps: End-to-End E-commerce with ML Recommendation System

ShopMLOps is a modern, full-stack e-commerce platform integrated with machine learning operations (MLOps) to provide intelligent product recommendations. It leverages a powerful tech stack to handle large datasets, provide real-time search, and offer personalized user experiences.

---

## 🚀 Key Features

- **Personalized Recommendations**: Content-based and user-based filtering using Scikit-learn (TF-IDF & Cosine Similarity).
- **High-Performance Search**: Full-text search powered by **Elasticsearch**.
- **Real-time Updates**: Scalable **FastAPI** backend with **Celery** for background processing.
- **Modern UI**: A responsive and interactive frontend built with **Next.js 14** and **Tailwind CSS**.
- **Robust Data Layer**: Multi-database architecture using **PostgreSQL** (Relational), **MongoDB** (NoSQL), **Redis** (Caching), and **Prisma** (ORM).
- **Synthetic Data Generation**: Integrated scripts to generate realistic e-commerce datasets for testing and training.
- **Dockerized Environment**: Simplified deployment and development flux with **Docker Compose**.

---

## 🏗️ Project Structure

```bash
├── Backend/          # FastAPI server, Prisma ORM, SQL/NoSQL schemas
├── Frontend/         # Next.js 14 web application, Tailwind CSS
├── Dataset/          # Synthetic data storage (CSV files)
├── ml/               # Machine Learning models and scripts
├── generate_data.py  # Script for dataset generation
└── docker-compose.yml # Infrastructure configuration
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks / Context API
- **ORM**: [Prisma](https://www.prisma.io/) (for local frontend management)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Task Queue**: [Celery](https://docs.celeryq.dev/)
- **Database**:
  - **PostgreSQL**: Transactional data (Orders, Users)
  - **MongoDB**: Catalog & Unstructured data
  - **Redis**: Caching & Session management
- **Search**: [Elasticsearch](https://www.elastic.co/)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)

### Machine Learning
- **Libraries**: Numpy, Pandas, Scikit-learn
- **Models**: TF-IDF Vectorization, Cosine Similarity (Content-based filtering)
- **Data Augmentation**: Custom synthetic data generation

---

## 🚦 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python (v3.10+)

### 2. Dataset Generation
Before running the app, generate the synthetic dataset:
```bash
python generate_data.py
```

### 3. Start Backend Services
Launch the infrastructure (PostgreSQL, MongoDB, Redis, Elasticsearch):
```bash
cd Backend
docker-compose up -d
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

### 4. Setup Frontend
Install dependencies and initialize the database:
```bash
cd Frontend
npm install
npx prisma generate
npx prisma db push
```

Run the development server:
```bash
npm run dev
```

---

## 🤖 Machine Learning Models

The recommendation engine is located in `ml/recommend.py`. It provides:
- **Item-to-Item Similarity**: Recommends products similar to the one being viewed.
- **User-Specific Recommendations**: Suggests products based on a user's interaction history (views, cart, transactions).

**To test the recommendation engine:**
```bash
python ml/recommend.py item 1001  # Recommendation for Item ID 1001
python ml/recommend.py user 5     # Recommendation for User ID 5
```

---

## 📝 License
This project is licensed under the MIT License.

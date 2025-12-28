# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 14+
- Git
- Docker (optional)

### Initial Setup

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/recommendation-mlops.git
cd recommendation-mlops
```

#### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**ML Service:**
```bash
cd ml
pip install -e .
# or
uv sync
```

#### 3. Database Setup
```bash
# Create database
createdb recommendation_db

# Run migrations (frontend)
cd frontend
npx prisma migrate dev

# Seed data (optional)
npx prisma db seed
```

#### 4. Environment Configuration
Copy `.env.example` to `.env` in each directory and update values.

---

## Development Workflow

### Running Services Locally

#### Terminal 1: Frontend
```bash
cd frontend
npm run dev
# Access at http://localhost:3000
```

#### Terminal 2: Backend API
```bash
cd backend
uvicorn app.main:app --reload --port 8080
# Access at http://localhost:8080
```

#### Terminal 3: ML Service
```bash
cd ml
python main.py serve --model bpr --port 8000
# Access at http://localhost:8000
```

#### Terminal 4: Database Admin (Optional)
```bash
# Frontend DB
cd frontend
npx prisma studio
# Access at http://localhost:5555

# Backend DB (different port)
cd backend
npx prisma studio --browser none --port 5556
```

### Hot Reload
All services support hot reload:
- **Frontend:** Next.js Fast Refresh
- **Backend:** Uvicorn `--reload` flag
- **ML Service:** Uvicorn `--reload` flag

---

## Project Structure

```
recommendation-mlops/
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── auth.ts       # Authentication
│   ├── prisma/           # Database schema
│   └── public/           # Static assets
│
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── database/    # DB connection
│   │   └── monitoring.py # Metrics
│   └── requirements.txt
│
├── ml/                   # ML service
│   ├── src/
│   │   ├── data/        # Data processing
│   │   ├── models/      # ML models
│   │   ├── training/    # Training scripts
│   │   ├── serving/     # API services
│   │   ├── evaluation/  # Metrics
│   │   └── monitoring/  # Drift detection
│   ├── models/          # Saved models
│   ├── data/            # Datasets
│   └── notebooks/       # Jupyter notebooks
│
└── docs/                # Documentation
```

---

## Code Style

### Frontend (TypeScript/React)

#### Formatting
```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

#### Conventions
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- Follow Next.js conventions for routing
- Use Tailwind CSS for styling

**Example Component:**
```typescript
'use client';

import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-muted-foreground">{product.description}</p>
    </div>
  );
}
```

### Backend (Python/FastAPI)

#### Formatting
```bash
# Format code
black .

# Lint
ruff check .

# Type check
mypy .
```

#### Conventions
- Follow PEP 8
- Use type hints
- Write docstrings for functions
- Use async/await for I/O operations

**Example Endpoint:**
```python
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter()

@router.get("/products", response_model=List[Product])
async def get_products(
    category: str | None = None,
    limit: int = 10
) -> List[Product]:
    """
    Retrieve products with optional filtering.
    
    Args:
        category: Filter by category slug
        limit: Maximum number of results
        
    Returns:
        List of products
    """
    # Implementation
    pass
```

---

## Testing

### Frontend Tests

#### Unit Tests (Jest)
```bash
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = { id: 1, name: 'Test Product' };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

#### E2E Tests (Playwright)
```bash
npx playwright test

# UI mode
npx playwright test --ui
```

### Backend Tests

#### Unit Tests (pytest)
```bash
pytest

# With coverage
pytest --cov=app

# Specific test
pytest tests/test_recommendations.py
```

**Example Test:**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_recommendations():
    response = client.get("/api/v1/recommendations/?user_id=1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### ML Tests

```bash
cd ml
pytest tests/
```

---

## Database Management

### Migrations

#### Creating Migrations
```bash
cd frontend
npx prisma migrate dev --name add_user_preferences
```

#### Applying Migrations
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

#### Resetting Database
```bash
npx prisma migrate reset
```

### Schema Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev`
3. Generate client: `npx prisma generate`
4. Update TypeScript types if needed

---

## Debugging

### Frontend

#### Next.js Debugger
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Next.js: debug server-side",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "port": 9229
}
```

#### Browser DevTools
- React DevTools extension
- Network tab for API calls
- Console for errors

### Backend

#### Python Debugger
```python
import pdb; pdb.set_trace()
```

#### FastAPI Debug Mode
```bash
uvicorn app.main:app --reload --log-level debug
```

#### VSCode Debugger
```json
// .vscode/launch.json
{
  "type": "python",
  "request": "launch",
  "name": "FastAPI",
  "module": "uvicorn",
  "args": ["app.main:app", "--reload"],
  "jinja": true
}
```

---

## Git Workflow

### Branch Naming
- `feature/add-user-preferences`
- `bugfix/fix-recommendation-error`
- `hotfix/critical-security-patch`
- `refactor/optimize-queries`

### Commit Messages
Follow conventional commits:
```
feat: add user preference filtering
fix: resolve recommendation timeout
docs: update API documentation
refactor: optimize database queries
test: add unit tests for recommendations
```

### Pull Request Process
1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Create PR with description
6. Address review comments
7. Merge after approval

---

## Performance Optimization

### Frontend
- Use Next.js Image component
- Implement code splitting
- Lazy load components
- Optimize bundle size
- Use React.memo for expensive components

### Backend
- Use database indexes
- Implement caching
- Optimize queries (avoid N+1)
- Use connection pooling
- Profile slow endpoints

### ML Service
- Pre-load models at startup
- Batch predictions when possible
- Use model caching
- Optimize matrix operations

---

## Common Tasks

### Adding a New API Endpoint

1. **Define Schema** (backend/app/schemas/)
```python
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    price: float
```

2. **Create Endpoint** (backend/app/api/)
```python
@router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    # Implementation
    pass
```

3. **Update Frontend** (frontend/src/)
```typescript
export async function createProduct(data: ProductCreate) {
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Adding a New Page

1. **Create Page** (frontend/src/app/new-page/page.tsx)
```typescript
export default function NewPage() {
  return <div>New Page</div>;
}
```

2. **Add Navigation** (frontend/src/components/Header.tsx)
```typescript
<Link href="/new-page">New Page</Link>
```

### Training a New Model

1. **Prepare Data**
```bash
cd ml
python src/data/loader.py
```

2. **Train Model**
```bash
python main.py train --model bpr --factors 100 --iterations 50
```

3. **Evaluate**
```bash
python main.py evaluate --model bpr
```

4. **Serve**
```bash
python main.py serve --model bpr --port 8000
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### Module Not Found
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
pip install -r requirements.txt --force-reinstall
```

### Prisma Client Out of Sync
```bash
npx prisma generate
```

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Implicit Docs](https://benfred.github.io/implicit/)

### Tools
- [Prisma Studio](https://www.prisma.io/studio)
- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database client

### Community
- GitHub Discussions
- Stack Overflow
- Discord/Slack (if available)

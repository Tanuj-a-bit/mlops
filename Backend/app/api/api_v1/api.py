from fastapi import APIRouter

# from app.api.api_v1.endpoints import login, users, products, cart, orders, categories
from app.api.api_v1.endpoints import recommendation

api_router = APIRouter()
# api_router.include_router(login.router, tags=["login"])
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(products.router, prefix="/products", tags=["products"])
# api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
# api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
# api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["recommendations"])

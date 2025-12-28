import pandas as pd
import os
import sys
import random
from datetime import datetime

# Add Backend directory to path so we can import app modules
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.database.postgres import SessionLocal, engine
from app.models.base import Base
from app.models.product import Category, Product
from app.models.user import User
from app.models.event import Event
from passlib.context import CryptContext

# Hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return f"dummy_hash_{password}"

DATASET_DIR = os.path.join(BASE_DIR, '../Dataset')
CATEGORY_FILE = os.path.join(DATASET_DIR, 'category_tree.csv')
ITEMS_FILE = os.path.join(DATASET_DIR, 'item_properties_part1.csv')
EVENTS_FILE = os.path.join(DATASET_DIR, 'events.csv')

def seed_categories(db):
    print("Seeding Categories...")
    if not os.path.exists(CATEGORY_FILE):
        print("Category file not found.")
        return

    df = pd.read_csv(CATEGORY_FILE)
    # expected cols: categoryid, parentid
    
    # Insert in order of parentid being null first logic? 
    # Or just insert all since we can set parent_id (it's nullable).
    # To avoid FK issues, we might need to be careful, but pure insert usually fine if constraints are deferred or we do root first.
    # Let's sort by parentid being null (roots) then others.
    
    df['parentid'] = df['parentid'].fillna(0).astype(int)
    # Assuming 0 means root, but standard is often Null. 
    # If 0 is not in categoryid list, we might have issue if we treat it as FK.
    # Let's insert roots first.
    
    # Actually, simpler: Insert all with parent_id=None initially, then update?
    # Or just try to parse hierarchy.
    
    # Let's clean the dataframe first
    categories_dict = {}
    
    for _, row in df.iterrows():
        cat_id = int(row['categoryid'])
        parent_id = row['parentid']
        parent_id = None if pd.isna(parent_id) or parent_id == 0 else int(parent_id)
        
        # We need a name. Dataset might not have it or it's just 'categoryid'.
        name = f"Supabase Category {cat_id}"
        slug = name.lower().replace(" ", "-") + f"-{cat_id}"
        image = f"https://images.unsplash.com/photo-{1500000000000 + cat_id}?w=400&q=80"
        
        cat = Category(id=cat_id, name=name, slug=slug, image=image, parent_id=parent_id)
        db.merge(cat) # merge handles update if exists
        
    db.commit()
    print("Categories seeded.")

def seed_products(db):
    print("Seeding Products...")
    if not os.path.exists(ITEMS_FILE):
        return

    df = pd.read_csv(ITEMS_FILE)
    # itemid, property, value
    
    item_ids = df['itemid'].unique()
    
    for item_id in item_ids:
        item_props = df[df['itemid'] == item_id]
        
        # Extract properties
        name = "Unknown Product"
        category_id = None
        price = 0.0
        image_url = None 
        available = True
        
        # Helper to get value safetly
        def get_val(prop):
            vals = item_props[item_props['property'] == prop]['value'].values
            return vals[0] if len(vals) > 0 else None

        name_val = get_val('name')
        if name_val: name = name_val
        
        cat_val = get_val('categoryid')
        if cat_val: category_id = int(cat_val)

        price_val = get_val('price')
        price = float(price_val) / 100.0 if price_val else 99.99
        
        image_val = get_val('image')
        image_url = image_val if image_val else f"https://images.unsplash.com/photo-{1500000000000 + int(item_id)}?w=400&q=80"
        
        product = Product(
            id=int(item_id),
            name=name,
            description=f"Description for {name}",
            price=price,
            category_id=category_id,
            image_url=image_url,
            available=available,
            rating=round(random.uniform(3.5, 5.0), 1),
            review_count=random.randint(5, 100),
            properties="{}"
        )
        db.merge(product)
        
    db.commit()
    print(f"Products seeded: {len(item_ids)}")

def seed_users_events(db):
    print("Seeding Users and Events...")
    if not os.path.exists(EVENTS_FILE):
        return

    df = pd.read_csv(EVENTS_FILE)
    # timestamp, visitorid, event, itemid, transactionid
    
    unique_visitors = df['visitorid'].unique()
    
    # Create Default Admin & Seller
    admin = User(
        id=100000, 
        email="admin@shopmlops.com", 
        full_name="Admin User", 
        hashed_password=get_password_hash("password123"),
        is_superuser=True
    )
    db.merge(admin)
    
    seller = User(
        id=100001, 
        email="seller@shopmlops.com", 
        full_name="Seller User", 
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db.merge(seller)
    
    # Create Users from events
    for vid in unique_visitors:
        user = User(
            id=int(vid),
            email=f"visitor{vid}@shopmlops.com",
            full_name=f"Visitor {vid}",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.merge(user)
    
    db.commit()
    
    # Events
    # Only insert a subset to be fast? Or all.
    # 2000 events is fast.
    
    events_to_add = []
    
    for _, row in df.iterrows():
        ts_str = row['timestamp']
        # timestamp in csv is likely string or int. 
        # generate_data says: datetime objects. 
        # Check generated format. simple string likely.
        
        # Fallback timestamp
        ts = datetime.utcnow()
        
        # Create Event object
        event = Event(
            timestamp=ts,
            visitor_id=int(row['visitorid']),
            event_type=row['event'],
            item_id=int(row['itemid']),
            transaction_id=str(row['transactionid']) if pd.notna(row['transactionid']) else None
        )
        events_to_add.append(event)
        
    # Bulk save might optionally be better but simple add is fine
    db.add_all(events_to_add)
    db.commit()
    print(f"Events seeded: {len(events_to_add)}")

def main():
    print("Dropping tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_products(db)
        seed_users_events(db)
        print("Done!")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()

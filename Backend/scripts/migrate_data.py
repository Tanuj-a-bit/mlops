import os
import sys
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.postgres import SessionLocal, engine
from app.models.base import Base
from app.models.product import Category, Product

DATASET_DIR = "/Users/tanujs/Desktop/mlops/Dataset"

def migrate_categories(db: Session):
    print("Migrating categories...")
    categories_df = pd.read_csv(os.path.join(DATASET_DIR, "category_tree.csv"))
    
    # First, insert categories without parents
    category_map = {} # id -> Category object
    
    # Sort to handle dependencies (parents first ideally, but csv might be mixed)
    # We'll stick to a simple strategy: Insert all with null parents, then update parents
    
    count = 0
    
    # Create all category objects
    for _, row in categories_df.iterrows():
        cat_id = int(row['categoryid'])
        cat = Category(id=cat_id, name=f"Category {cat_id}")
        db.merge(cat) # merge handles insert or update
        count += 1
        
    db.commit()
    print(f"Created {count} categories")
    
    # Now update parent relationships
    print("Updating parent relationships...")
    updates = 0
    for _, row in categories_df.iterrows():
        cat_id = int(row['categoryid'])
        parent_id = row['parentid']
        
        if pd.notna(parent_id):
            parent_id = int(parent_id)
            # Fetch and update
            cat = db.query(Category).filter(Category.id == cat_id).first()
            if cat:
                cat.parent_id = parent_id
                updates += 1
                
    db.commit()
    print(f"Updated {updates} parent relationships")

def migrate_products(db: Session):
    print("Migrating products properties (Sample)...")
    # For now, we'll process a chunk of the properties file as it's large (11M rows)
    # We will aggregate properties to create products
    
    # Reading a chunk for demonstration/development
    # In production, we'd read the whole file in chunks
    chunk_size = 50000
    file_path = os.path.join(DATASET_DIR, "item_properties_part1.csv")
    
    count = 0
    
    # We need to pivot the properties
    # This is a simplified migration. Real world would be more complex.
    # itemid, property, value
    
    # Let's just create products from unique item IDs found in the chunk
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        # We look for 'categoryid' property to link categories
        category_props = chunk[chunk['property'] == 'categoryid']
        
        for _, row in category_props.iterrows():
            item_id = int(row['itemid'])
            category_id = int(row['value'])
            
            # Check if product exists
            existing = db.query(Product).filter(Product.id == item_id).first()
            if not existing:
                # Create rudimentary product
                product = Product(
                    id=item_id,
                    name=f"Product {item_id}",
                    price=np.random.uniform(10, 500), # Mock price as it's not in properties
                    category_id=category_id,
                    available=True,
                    description="Imported from dataset"
                )
                db.merge(product)
                count += 1
        
        db.commit()
        print(f"Processed chunk, total products: {count}")
        
        # Stop after some products for dev environment speed
        if count > 5000:
            break
            
    print(f"Migration complete. Total products seeded: {count}")

def main():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        migrate_categories(db)
        migrate_products(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()

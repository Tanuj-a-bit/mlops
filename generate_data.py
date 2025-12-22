import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

# Configuration
NUM_CATEGORIES = 20
NUM_PRODUCTS = 200
NUM_USERS = 100
NUM_EVENTS = 2000
DATASET_DIR = 'Dataset'

# Ensure directory exists
os.makedirs(DATASET_DIR, exist_ok=True)

# 1. Generate category_tree.csv
print("Generating category_tree.csv...")
categories = [
    "Electronics", "Computers", "Smartphones", "Accessories",
    "Fashion", "Men's Clothing", "Women's Clothing", "Shoes",
    "Home & Garden", "Kitchen", "Furniture", "Decor",
    "Sports", "Fitness", "Outdoor", "Cycling",
    "Books", "Fiction", "Non-Fiction", "Self-Help"
]

category_data = []
for i, name in enumerate(categories):
    cid = i + 1
    # Simple hierarchy: first 4 are roots, others are children
    pid = None
    if i >= 4:
        pid = (i % 4) + 1
    category_data.append({'categoryid': cid, 'parentid': pid})

pd.DataFrame(category_data).to_csv(os.path.join(DATASET_DIR, 'category_tree.csv'), index=False)

# 2. Generate item_properties_part1.csv
print("Generating item_properties_part1.csv...")
product_properties = []

adjectives = ["Professional", "Premium", "Ultra", "Essential", "Classic", "Modern", "Eco"]
nouns = ["Gadget", "Tool", "Apparel", "Device", "Supply", "Gear", "Item"]

for i in range(NUM_PRODUCTS):
    item_id = i + 1000
    category_idx = random.randint(0, len(categories) - 1)
    category_id = category_idx + 1
    category_name = categories[category_idx]
    
    name = f"{random.choice(adjectives)} {category_name} {random.choice(nouns)}"
    price = round(random.uniform(10, 1000) * 100) # In cents for seed script
    
    # Store timestamp for property (required by seed script)
    ts = int((datetime.now() - timedelta(days=random.randint(0, 30))).timestamp() * 1000)
    
    # Required properties for seed.ts
    product_properties.append({'timestamp': ts, 'itemid': item_id, 'property': 'categoryid', 'value': category_id})
    product_properties.append({'timestamp': ts, 'itemid': item_id, 'property': 'name', 'value': name})
    product_properties.append({'timestamp': ts, 'itemid': item_id, 'property': 'price', 'value': price})
    
    # Add an image URL property
    image_url = f"https://images.unsplash.com/photo-{1500000000000 + item_id}?w=400&q=80"
    product_properties.append({'timestamp': ts, 'itemid': item_id, 'property': 'image', 'value': image_url})

pd.DataFrame(product_properties).to_csv(os.path.join(DATASET_DIR, 'item_properties_part1.csv'), index=False)

# 3. Generate events.csv
print("Generating events.csv...")
events = []
event_types = ['view', 'addtocart', 'transaction']
weights = [0.8, 0.15, 0.05]

start_time = datetime.now() - timedelta(days=90)

for i in range(NUM_EVENTS):
    visitor_id = random.randint(1, NUM_USERS)
    item_id = random.randint(1000, 1000 + NUM_PRODUCTS - 1)
    event_type = random.choices(event_types, weights=weights)[0]
    
    timestamp = int((start_time + timedelta(seconds=random.randint(0, 90*24*3600))).timestamp() * 1000)
    
    transaction_id = None
    if event_type == 'transaction':
        transaction_id = f"tx_{random.randint(10000, 99999)}"
        
    events.append({
        'timestamp': timestamp,
        'visitorid': visitor_id,
        'event': event_type,
        'itemid': item_id,
        'transactionid': transaction_id
    })

pd.DataFrame(events).to_csv(os.path.join(DATASET_DIR, 'events.csv'), index=False)

print(f"Successfully generated dataset in {DATASET_DIR}/")

import os
import sys
import pandas as pd
from pymongo import ASCENDING

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import mongodb, get_mongo_db

DATASET_DIR = "/Users/tanujs/Desktop/mlops/Dataset"

def process_events():
    print("Processing events to MongoDB...")
    mongodb.connect()
    db = get_mongo_db()
    collection = db.events
    
    # Create indexes
    collection.create_index([("timestamp", ASCENDING)])
    collection.create_index([("visitorid", ASCENDING)])
    collection.create_index([("itemid", ASCENDING)])
    
    file_path = os.path.join(DATASET_DIR, "events.csv")
    chunk_size = 100000
    
    count = 0
    
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        # Convert to dict records
        records = chunk.to_dict('records')
        
        # Insert into MongoDB
        if records:
            collection.insert_many(records)
            count += len(records)
            print(f"Inserted {count} events...")
            
        # For dev, limit to 200k events
        if count >= 200000:
            break
            
    print(f"Finished. Total events inserted: {count}")
    mongodb.close()

if __name__ == "__main__":
    process_events()

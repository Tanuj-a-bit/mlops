from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.schemas.recommendation import RecommendedItem
from app.database.postgres import get_db, engine
from app.models.product import Product
from app.models.event import Event
from app.models.product import Category

router = APIRouter()

# Global variables to hold model and data
# In a production environment, these should be loaded in a startup event or a singleton service
cosine_sim = None
df_items = None
df_events = None

def load_model_from_db():
    global cosine_sim, df_items, df_events
    print("Loading Recommendation Model from Database...")
    
    # helper to get DF from easy query
    # We use engine connection for pandas
    try:
        # Load Items (Products joined with Categories for better content)
        # Using raw SQL or ORM. Pandas read_sql prefers SQL or connection.
        query_items = "SELECT p.id as itemid, p.name, p.category_id as categoryid, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id"
        df_items_raw = pd.read_sql(query_items, engine)
        
        # Load Events
        # We need visitorid, itemid, timestamp, event (event_type)
        # Check Event model columns: visitor_id, item_id, event_type, timestamp
        query_events = "SELECT visitor_id as visitorid, item_id as itemid, event_type as event, timestamp FROM events"
        df_events = pd.read_sql(query_events, engine)

        if df_items_raw.empty:
            print("No items found in DB. Skipping model load.")
            return

        # Process Items for TF-IDF
        items_list = []
        
        for _, row in df_items_raw.iterrows():
            name = row['name'] if row['name'] else "Unknown"
            cat_id = str(row['categoryid']) if row['categoryid'] else "0"
            cat_name = row['category_name'] if row['category_name'] else ""
            
            items_list.append({
                'itemid': row['itemid'],
                'name': name,
                'categoryid': cat_id,
                'content': f"{name} {cat_name} {cat_id}"
            })
            
        df_items = pd.DataFrame(items_list)
        
        tfidf = TfidfVectorizer(stop_words='english')
        if df_items.empty:
            cosine_sim = None
            return

        tfidf_matrix = tfidf.fit_transform(df_items['content'])
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        print(f"Recommendation Model Loaded. Items: {len(df_items)}, Events: {len(df_events)}")

    except Exception as e:
        print(f"Failed to load model from DB: {e}")

# Initialize model on module import
# In production, use @app.on_event("startup") in main.py to call this
# For now, simplistic lazy load or import time load
try:
    load_model_from_db()
except Exception as e:
    print(f"Error initializing model: {e}")

def get_item_recommendations(item_id: int, limit: int = 5) -> List[RecommendedItem]:
    if cosine_sim is None or df_items is None:
        return []
        
    try:
        idx = df_items[df_items['itemid'] == item_id].index[0]
    except IndexError:
        return []

    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:limit+1]
    
    item_indices = [i[0] for i in sim_scores]
    recs = df_items.iloc[item_indices][['itemid', 'name', 'categoryid']].to_dict('records')
    return [RecommendedItem(**r) for r in recs]

def get_user_recommendations(user_id: int, limit: int = 5) -> List[RecommendedItem]:
    if df_events is None or df_items is None:
        return []

    # Filter events for user
    user_events = df_events[df_events['visitorid'] == user_id]
    
    if user_events.empty:
        # Popular items logic using DB events df
        if 'itemid' in df_events.columns and not df_events.empty:
             popular_ids = df_events['itemid'].value_counts().head(limit).index.tolist()
             popular_items = df_items[df_items['itemid'].isin(popular_ids)][['itemid', 'name', 'categoryid']].to_dict('records')
             return [RecommendedItem(**r) for r in popular_items]
        return []

    # Last interaction logic
    # Sort by timestamp
    last_items = user_events.sort_values('timestamp', ascending=False)['itemid'].unique()[:3]
    recommendations = []
    
    for item_id in last_items:
        recs = get_item_recommendations(item_id, limit=2) 
        recommendations.extend(recs)
        
    # Deduplicate
    seen = set(user_events['itemid'].unique())
    unique_recs = []
    for r in recommendations:
        if r.itemid not in seen and r.itemid not in [u.itemid for u in unique_recs]:
            unique_recs.append(r)
            if len(unique_recs) >= limit:
                break
    
    return unique_recs

@router.get("/", response_model=List[RecommendedItem])
def get_recommendations(
    user_id: Optional[int] = None,
    item_id: Optional[int] = None,
    limit: int = 5
):
    # Check if model loaded properly, try reloading if empty (simple failover)
    global df_items
    if df_items is None:
        load_model_from_db()

    if not user_id and not item_id:
        raise HTTPException(status_code=400, detail="Must provide user_id or item_id")
        
    if user_id:
        return get_user_recommendations(user_id, limit)
    else:
        return get_item_recommendations(item_id, limit)

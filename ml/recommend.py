import pandas as pd
import numpy as np
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(SCRIPT_DIR, '../Dataset')
ITEMS_FILE = os.path.join(DATASET_DIR, 'item_properties_part1.csv')
EVENTS_FILE = os.path.join(DATASET_DIR, 'events.csv')

def load_data():
    # Load items and pivot properties
    df_items_raw = pd.read_csv(ITEMS_FILE)
    
    # We need to extract 'name' and 'categoryid' for content-based filtering
    # The CSV has multiple rows per itemid for different properties
    items_list = []
    item_ids = df_items_raw['itemid'].unique()
    
    for item_id in item_ids:
        item_props = df_items_raw[df_items_raw['itemid'] == item_id]
        name = item_props[item_props['property'] == 'name']['value'].values[0]
        category_id = item_props[item_props['property'] == 'categoryid']['value'].values[0]
        items_list.append({
            'itemid': item_id,
            'name': name,
            'categoryid': category_id,
            'content': f"{name} {category_id}" # Simple content string
        })
    
    df_items = pd.DataFrame(items_list)
    df_events = pd.read_csv(EVENTS_FILE)
    
    return df_items, df_events

def build_content_model(df_items):
    print("Building content-based model...")
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_items['content'])
    
    # Compute cosine similarity between all items
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return cosine_sim

def get_recommendations(item_id, df_items, cosine_sim, top_n=5):
    # Get index of the item
    try:
        idx = df_items[df_items['itemid'] == item_id].index[0]
    except IndexError:
        return []

    # Get pairwise similarity scores
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort items based on similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Get top N most similar items (excluding itself)
    sim_scores = sim_scores[1:top_n+1]

    # Get item indices
    item_indices = [i[0] for i in sim_scores]

    # Return top N similar items
    return df_items.iloc[item_indices][['itemid', 'name', 'categoryid']].to_dict('records')

def get_user_recommendations(user_id, df_items, df_events, cosine_sim, top_n=5):
    # Get items the user has interacted with
    user_events = df_events[df_events['visitorid'] == user_id]
    if user_events.empty:
        # Fallback to popular items if no history
        print(f"No history for user {user_id}, returning popular items...")
        popular_items = df_events['itemid'].value_counts().head(top_n).index.tolist()
        return df_items[df_items['itemid'].isin(popular_items)][['itemid', 'name', 'categoryid']].to_dict('records')

    # Get the last few items the user interacted with
    last_items = user_events.sort_values('timestamp', ascending=False)['itemid'].unique()[:3]
    
    recommendations = []
    for item_id in last_items:
        recs = get_recommendations(item_id, df_items, cosine_sim, top_n=2)
        recommendations.extend(recs)
    
    # De-duplicate and limit
    seen = set(user_events['itemid'].unique())
    unique_recs = []
    for r in recommendations:
        if r['itemid'] not in seen and r['itemid'] not in [u['itemid'] for u in unique_recs]:
            unique_recs.append(r)
            if len(unique_recs) >= top_n:
                break
                
    return unique_recs

import sys
import json

if __name__ == "__main__":
    df_items, df_events = load_data()
    cosine_sim = build_content_model(df_items)
    
    if len(sys.argv) > 2:
        mode = sys.argv[1] # 'item' or 'user'
        target_id = int(sys.argv[2])
        
        if mode == 'item':
            results = get_recommendations(target_id, df_items, cosine_sim)
        elif mode == 'user':
            results = get_user_recommendations(target_id, df_items, df_events, cosine_sim)
        else:
            results = []
            
        print(json.dumps(results))
    else:
        # Default test mode if no args
        sample_item_id = df_items['itemid'].iloc[0]
        item_recs = get_recommendations(sample_item_id, df_items, cosine_sim)
        sample_user_id = df_events['visitorid'].iloc[0]
        user_recs = get_user_recommendations(sample_user_id, df_items, df_events, cosine_sim)
        
        print(json.dumps({
            "sample_item": {"id": int(sample_item_id), "recommendations": item_recs},
            "sample_user": {"id": int(sample_user_id), "recommendations": user_recs}
        }))

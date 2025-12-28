from src.models.collaborative_filtering import ALSRecommender
import pandas as pd
import numpy as np

def test_als_recommender_training():
    data = {
        'visitorid': [1, 1, 2, 2, 3, 3],
        'itemid': [101, 102, 101, 103, 102, 104],
        'weight': [1, 1, 1, 1, 1, 1]
    }
    df = pd.DataFrame(data)
    
    recommender = ALSRecommender(factors=4, iterations=5)
    recommender.train(df)
    
    # Check if mappings are created
    assert 1 in recommender.user_map
    assert 101 in recommender.item_map
    
    # Check if recommendations return something
    recs = recommender.recommend(1, n=2)
    assert len(recs) <= 2
    assert isinstance(recs, list)

def test_als_recommender_unknown_user():
    recommender = ALSRecommender()
    recommender.user_map = {1: 0}
    recommender.inv_item_map = {0: 101}
    
    # Recommend for user not in map should return empty list
    recs = recommender.recommend(99)
    assert recs == []

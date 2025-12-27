from src.data.preprocessor import Preprocessor
import pandas as pd
import pytest

def test_preprocessor_min_interactions():
    # Mock data: user 1 has 3, user 2 has 1
    data = {
        'visitorid': [1, 1, 1, 2],
        'itemid': [101, 102, 103, 101],
        'timestamp': [1000, 2000, 3000, 4000],
        'event': ['view', 'view', 'view', 'view']
    }
    df = pd.DataFrame(data)
    
    # Filter for min 2 interactions
    preprocessor = Preprocessor(min_interactions=2)
    cleaned = preprocessor.clean_events(df)
    
    assert 2 not in cleaned['visitorid'].values
    assert 1 in cleaned['visitorid'].values
    assert len(cleaned) == 3

def test_preprocessor_duplicates():
    data = {
        'visitorid': [1, 1],
        'itemid': [101, 101],
        'timestamp': [1000, 1000],
        'event': ['view', 'view']
    }
    df = pd.DataFrame(data)
    preprocessor = Preprocessor(min_interactions=1)
    cleaned = preprocessor.clean_events(df)
    
    assert len(cleaned) == 1

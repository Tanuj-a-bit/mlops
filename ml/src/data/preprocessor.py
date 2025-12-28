import pandas as pd
import numpy as np
import os

class Preprocessor:
    """
    Cleans and preprocesses the RetailRocket dataset.
    """
    
    def __init__(self, min_interactions=5):
        self.min_interactions = min_interactions

    def clean_events(self, events_df):
        """
        Cleans the events dataframe:
        - Converts timestamps
        - Removes duplicates
        - Filters out cold-start users
        """
        # Convert timestamp to datetime
        events_df['timestamp'] = pd.to_datetime(events_df['timestamp'], unit='ms')
        
        # Remove duplicates
        events_df = events_df.drop_duplicates()
        
        # Filter users with minimum number of interactions
        user_counts = events_df['visitorid'].value_counts()
        active_users = user_counts[user_counts >= self.min_interactions].index
        events_df = events_df[events_df['visitorid'].isin(active_users)]
        
        return events_df

    def create_interaction_weights(self, events_df):
        """
        Assigns weights to interaction types for implicit feedback.
        """
        event_type_weights = {
            'view': 1,
            'addtocart': 50,
            'transaction': 250
        }
        
        # Create a copy to avoid SettingWithCopyWarning
        df = events_df.copy()
        df['weight'] = df['event'].map(event_type_weights)
        
        # Aggregate weights per user-item pair
        interactions = df.groupby(['visitorid', 'itemid'])['weight'].sum().reset_index()
        
        return interactions

    def temporal_split(self, events_df, test_days=14):
        """
        Splits events into train and test sets based on time.
        The last 'test_days' of data are used for the test set.
        """
        max_ts = events_df['timestamp'].max()
        split_ts = max_ts - pd.Timedelta(days=test_days)
        
        train_events = events_df[events_df['timestamp'] < split_ts]
        test_events = events_df[events_df['timestamp'] >= split_ts]
        
        # Only evaluate on users who are in the training set (to avoid pure cold start evaluation)
        train_users = set(train_events['visitorid'].unique())
        test_events = test_events[test_events['visitorid'].isin(train_users)]
        
        return train_events, test_events

if __name__ == "__main__":
    from src.data.loader import DataLoader
    
    # Ensure directory exists
    os.makedirs("data/processed", exist_ok=True)
    
    loader = DataLoader()
    print("Loading raw events...")
    events = loader.load_events()
    
    preprocessor = Preprocessor(min_interactions=10)
    print("Cleaning events...")
    cleaned_events = preprocessor.clean_events(events)
    
    print("Performing temporal split (last 7 days as test)...")
    train_events, test_events = preprocessor.temporal_split(cleaned_events)
    
    print("Aggregating interaction weights...")
    train_interactions = preprocessor.create_interaction_weights(train_events)
    test_interactions = preprocessor.create_interaction_weights(test_events)
    
    print(f"Train pairs: {len(train_interactions)}")
    print(f"Test pairs: {len(test_interactions)}")
    
    # Save outputs
    train_interactions.to_parquet("data/processed/train_interactions.parquet")
    test_interactions.to_parquet("data/processed/test_interactions.parquet")
    
    # Also save a unified version for back-compat if needed
    unified = pd.concat([train_interactions, test_interactions])
    unified.to_parquet("data/processed/interactions.parquet")
    
    print("Saved datasets to data/processed/")

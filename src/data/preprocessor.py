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
        - view: 1
        - addtocart: 3
        - transaction: 5
        """
        event_type_weights = {
            'view': 1,
            'addtocart': 20,
            'transaction': 100
        }
        
        events_df['weight'] = events_df['event'].map(event_type_weights)
        
        # Aggregate weights per user-item pair
        interactions = events_df.groupby(['visitorid', 'itemid'])['weight'].sum().reset_index()
        
        return interactions

if __name__ == "__main__":
    from src.data.loader import DataLoader
    
    # Ensure directory exists
    os.makedirs("data/processed", exist_ok=True)
    
    loader = DataLoader()
    print("Loading...")
    events = loader.load_events()
    
    preprocessor = Preprocessor(min_interactions=10)
    print("Cleaning...")
    cleaned_events = preprocessor.clean_events(events)
    print(f"Cleaned events: {len(cleaned_events)}")
    
    print("Creating interaction matrix...")
    interactions = preprocessor.create_interaction_weights(cleaned_events)
    print(f"Interaction pairs: {len(interactions)}")
    
    # Save output for DVC
    output_path = "data/processed/interactions.parquet"
    interactions.to_parquet(output_path)
    print(f"Saved interactions to {output_path}")

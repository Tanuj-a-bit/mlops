import pandas as pd
import os

class DataLoader:
    """
    Utility class for loading the RetailRocket dataset.
    
    Data Source Acknowledgement:
    The dataset is the RetailRocket Recommender System dataset, 
    originally published on Kaggle (https://www.kaggle.com/datasets/retailrocket/ecommerce-dataset).
    """
    
    def __init__(self, data_dir="/Users/tanujs/Desktop/recommendation-mlops/ml/data/raw"):
        self.data_dir = data_dir

    def load_events(self):
        """Load transaction and behavior events."""
        path = os.path.join(self.data_dir, "events.csv")
        return pd.read_csv(path)

    def load_category_tree(self):
        """Load the category hierarchy."""
        path = os.path.join(self.data_dir, "category_tree.csv")
        return pd.read_csv(path)

    def load_item_properties(self):
        """Load and merge item property files."""
        p1_path = os.path.join(self.data_dir, "item_properties_part1.csv")
        p2_path = os.path.join(self.data_dir, "item_properties_part2.csv")
        
        p1 = pd.read_csv(p1_path)
        p2 = pd.read_csv(p2_path)
        
        return pd.concat([p1, p2], ignore_index=True)

if __name__ == "__main__":
    loader = DataLoader()
    print("Loading events...")
    events = loader.load_events()
    print(f"Loaded {len(events)} events.")
    
    print("\nColumn Info:")
    print(events.info())

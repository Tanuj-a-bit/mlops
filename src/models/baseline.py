import pandas as pd

class PopularityRecommender:
    """
    Baseline recommender that suggests the most popular items.
    """
    
    def __init__(self):
        self.popular_items = None

    def train(self, interactions_df):
        """
        Learns the most popular items based on aggregate weights.
        """
        # Sum weights per item
        item_popularity = interactions_df.groupby('itemid')['weight'].sum().sort_values(ascending=False)
        self.popular_items = item_popularity.index.tolist()

    def recommend(self, n=10):
        """
        Returns the top N popular items.
        """
        if self.popular_items is None:
            raise ValueError("Model must be trained first.")
        return self.popular_items[:n]

if __name__ == "__main__":
    # Mock data for testing
    data = {
        'visitorid': [1, 1, 2, 2, 3],
        'itemid': [101, 102, 101, 103, 101],
        'weight': [1, 1, 5, 3, 1]
    }
    df = pd.DataFrame(data)
    
    model = PopularityRecommender()
    model.train(df)
    print("Top 2 Recommendations:", model.recommend(n=2))

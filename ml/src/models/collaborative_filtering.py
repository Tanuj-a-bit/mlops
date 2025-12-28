import implicit
from scipy.sparse import csr_matrix
import numpy as np
import pandas as pd

class ALSRecommender:
    """
    Collaborative Filtering recommender using Alternating Least Squares (ALS).
    """
    
    def __init__(self, factors=50, regularization=0.01, iterations=20):
        self.factors = factors
        self.regularization = regularization
        self.iterations = iterations
        self.total_iterations = 0
        self.model = implicit.als.AlternatingLeastSquares(
            factors=self.factors, 
            regularization=self.regularization, 
            iterations=self.iterations,
            random_state=42
        )
        self.user_map = {}
        self.item_map = {}
        self.inv_item_map = {}

    def _prepare_matrix(self, df):
        """Converts interaction dataframe to sparse matrix for implicit."""
        # Get unique users and items from the current dataframe
        users = df['visitorid'].unique()
        items = df['itemid'].unique()
        
        # If maps don't exist, initialize them
        if not self.user_map:
            self.user_map = {uid: i for i, uid in enumerate(users)}
        else:
            # Add only new users
            for uid in users:
                if uid not in self.user_map:
                    self.user_map[uid] = len(self.user_map)
                    
        if not self.item_map:
            self.item_map = {iid: i for i, iid in enumerate(items)}
            self.inv_item_map = {i: iid for iid, i in self.item_map.items()}
        else:
            # Add only new items
            for iid in items:
                if iid not in self.item_map:
                    new_idx = len(self.item_map)
                    self.item_map[iid] = new_idx
                    self.inv_item_map[new_idx] = iid
        
        row = df['visitorid'].map(self.user_map).values
        col = df['itemid'].map(self.item_map).values
        data = df['weight'].values
        
        # Matrix should be (users, items)
        # Use the max index to ensure the matrix covers all known users/items
        num_users = len(self.user_map)
        num_items = len(self.item_map)
        
        return csr_matrix((data, (row, col)), shape=(num_users, num_items))

    def train(self, df):
        """Trains the ALS model with BM25 weighting."""
        self.matrix = self._prepare_matrix(df)
        
        # Apply BM25 weighting to improve results
        from implicit.nearest_neighbours import bm25_weight
        # implicit expects (items, users) for weighting usually, or it doesn't matter much 
        # but we'll weight our CSR matrix directly.
        weighted_matrix = bm25_weight(self.matrix.T, K1=100, B=0.8).T.tocsr()
        
        # Implicit ALS expects (items, users) in some versions or prefers it.
        # We pass user_items matrix.
        self.model.fit(weighted_matrix)
        
        # Handle cases where the model was loaded from an older version without this attribute
        if not hasattr(self, 'total_iterations'):
            self.total_iterations = 0
            
        self.total_iterations += self.iterations

    def recommend(self, user_id, n=10):
        """Recommends items for a specific user."""
        if user_id not in self.user_map:
            # Handle cold start or unknown user by returning empty or using fallback
            return []
            
        user_idx = self.user_map[user_id]
        
        # recommendation returns (item_indices, scores)
        # Allow suggesting already liked items to capture repeat purchase/visit intent
        ids, scores = self.model.recommend(user_idx, self.matrix[user_idx], N=n, filter_already_liked_items=False)
        
        return [self.inv_item_map[idx] for idx in ids]

if __name__ == "__main__":
    # Test with static data or small sample
    print("ALS Recommender Initialized.")

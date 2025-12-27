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
        # Create continuous mapping for IDs
        users = df['visitorid'].unique()
        items = df['itemid'].unique()
        
        self.user_map = {uid: i for i, uid in enumerate(users)}
        self.item_map = {iid: i for i, iid in enumerate(items)}
        self.inv_item_map = {i: iid for iid, i in self.item_map.items()}
        
        row = df['visitorid'].map(self.user_map).values
        col = df['itemid'].map(self.item_map).values
        data = df['weight'].values
        
        # Matrix should be (items, users) for ALS training in many versions, 
        # but modern implicit often takes (users, items).
        # We'll use (users, items) and let implicit handle it.
        return csr_matrix((data, (row, col)), shape=(len(users), len(items)))

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

    def recommend(self, user_id, n=10):
        """Recommends items for a specific user."""
        if user_id not in self.user_map:
            # Handle cold start or unknown user by returning empty or using fallback
            return []
            
        user_idx = self.user_map[user_id]
        
        # recommendation returns (item_indices, scores)
        # We allow recommending already liked items for higher precision (re-consumption/repeat visits)
        ids, scores = self.model.recommend(user_idx, self.matrix[user_idx], N=n, filter_already_liked_items=False)
        
        return [self.inv_item_map[idx] for idx in ids]

if __name__ == "__main__":
    # Test with static data or small sample
    print("ALS Recommender Initialized.")

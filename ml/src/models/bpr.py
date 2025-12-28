import implicit
from scipy.sparse import csr_matrix
import numpy as np
import pandas as pd
import pickle

class BPRRecommender:
    """
    Collaborative Filtering recommender using Bayesian Personalized Ranking (BPR).
    """
    
    def __init__(self, factors=100, learning_rate=0.01, regularization=0.01, iterations=50):
        self.factors = factors
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.iterations = iterations
        self.total_iterations = 0
        self.model = implicit.bpr.BayesianPersonalizedRanking(
            factors=self.factors, 
            learning_rate=self.learning_rate,
            regularization=self.regularization, 
            iterations=self.iterations,
            random_state=42
        )
        self.user_map = {}
        self.item_map = {}
        self.inv_item_map = {}

    def _prepare_matrix(self, df):
        """Converts interaction dataframe to sparse matrix for implicit."""
        users = df['visitorid'].unique()
        items = df['itemid'].unique()
        
        if not self.user_map:
            self.user_map = {uid: i for i, uid in enumerate(users)}
        else:
            for uid in users:
                if uid not in self.user_map:
                    self.user_map[uid] = len(self.user_map)
                    
        if not self.item_map:
            self.item_map = {iid: i for i, iid in enumerate(items)}
            self.inv_item_map = {i: iid for iid, i in self.item_map.items()}
        else:
            for iid in items:
                if iid not in self.item_map:
                    new_idx = len(self.item_map)
                    self.item_map[iid] = new_idx
                    self.inv_item_map[new_idx] = iid
        
        row = df['visitorid'].map(self.user_map).values
        col = df['itemid'].map(self.item_map).values
        # BPR uses binary interactions
        data = np.ones(len(row))
        
        num_users = len(self.user_map)
        num_items = len(self.item_map)
        
        return csr_matrix((data, (row, col)), shape=(num_users, num_items))

    def train(self, df):
        """Trains the BPR model."""
        self.matrix = self._prepare_matrix(df)
        self.model.fit(self.matrix)
        
        if not hasattr(self, 'total_iterations'):
            self.total_iterations = 0
        self.total_iterations += self.iterations

    def recommend(self, user_id, n=10):
        """Recommends items for a specific user."""
        if user_id not in self.user_map:
            return []
            
        user_idx = self.user_map[user_id]
        ids, scores = self.model.recommend(user_idx, self.matrix[user_idx], N=n, filter_already_liked_items=False)
        return [self.inv_item_map[idx] for idx in ids]

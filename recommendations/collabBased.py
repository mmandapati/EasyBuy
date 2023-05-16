import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader
from surprise import KNNWithMeans
import sys

reader = Reader(rating_scale=(1, 5))
inputdata = pd.read_csv('/Users/ananyaannadatha/Documents/GitHub/full-stack/backend/csvFiles/ratings.csv')
ratings_df = pd.DataFrame(inputdata)
data = Dataset.load_from_df(ratings_df[['UserId', 'ProductId', 'Rating']], reader)

# Choose the collaborative filtering algorithm (here, using user-based approach)
algo = KNNWithMeans(k=5, sim_options={'name': 'cosine', 'user_based': True})

# Train the algorithm on the entire dataset
trainset = data.build_full_trainset()
algo.fit(trainset)



# Function to get recommended products based on the given userID and itemID
def get_recommendations(user_id, item_id, top_n=5):
  try:
    # Get the inner user ID and item ID from the raw IDs
    inner_user_id = trainset.to_inner_uid(user_id)
    inner_item_id = trainset.to_inner_iid(item_id)

    # Get the top-N similar users to the given user
    user_neighbors = algo.get_neighbors(inner_user_id, k=top_n)
    # Get the raw item IDs for the similar users and filter the ones that are not already bought by the given user
    raw_item_ids = []
    for neighbor_id in user_neighbors:
        neighbor_item_id = trainset.to_raw_iid(neighbor_id)
        if neighbor_item_id != item_id and neighbor_item_id not in ratings_df[ratings_df['UserId'] == user_id]['ProductId']:
            raw_item_ids.append(neighbor_item_id)
    return raw_item_ids
    

  except ValueError:
        print("User or item ID not found in the trainset.")

# Example usage: Get top 5 recommended products for user with ID 'user1' and item with ID 'product1'
user_id = sys.argv[2]
item_id = sys.argv[1]
recommended_products = get_recommendations(user_id, item_id, top_n=5)

for i in recommended_products:
  print(i)
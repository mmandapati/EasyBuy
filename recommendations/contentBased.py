import pandas as pd
import numpy as np
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

arg1 = sys.argv[1]
# Load the dataset in chunks to save memory
chunk_size = 1000

data_chunks = pd.read_csv('/Users/ananyaannadatha/Documents/GitHub/full-stack/backend/csvFiles/productsData.csv', chunksize=chunk_size, usecols=["_id", "name"])
df = pd.concat(data_chunks)


# Create a sparse TF-IDF matrix
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['name'])

# Compute pairwise cosine similarities between items
cosine_similarities = cosine_similarity(tfidf_matrix)

# Build a dictionary of itemID and its most similar items
results = {}
for i in range(cosine_similarities.shape[0]):
    similar_indices = cosine_similarities[i].argsort()[:-11:-1] # Exclude the item itself
    similar_items = [(cosine_similarities[i][j], df['_id'].iloc[j]) for j in similar_indices]
    results[df['_id'].iloc[i]] = similar_items[1:]

# Function to recommend similar items based on itemID
def recommend(itemID, num):
    if itemID not in results:
        print('ItemID not found.')
        return
    for i, (similarity, similar_item) in enumerate(results[itemID][:num]):
        print(similar_item)

# Example usage
recommend(arg1, 5)
#retreieval logic
#user query -> embed the query -> similarity search (query the vector DB) -> check threshold -> return results
import os
from dotenv import load_dotenv

load_dotenv()

THRESHOLD = float(os.getenv("THRESHOLD", "0.4"))


def retrieve(query, collection):
    
    # query chromadb
    collection_results = collection.query(
        query_texts=[query],
        n_results=5
    )
    
    # check threshold
    print("---set up threshold---")
    print("THRESHOLD VALUE:", THRESHOLD)
    distances = collection_results['distances'][0]
    print("----getting distances----")
    print(distances)
    is_covered = any(d <= THRESHOLD for d in distances)
    
    # extract chunks and sources
    chunks = collection_results['documents'][0]
    sources = [m['filename'] for m in collection_results['metadatas'][0]]
    
    return {
        "chunks": chunks,
        "sources": sources,
        "is_covered": is_covered
    }



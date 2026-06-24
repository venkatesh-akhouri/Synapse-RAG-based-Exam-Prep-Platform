from langchain_huggingface import HuggingFaceEmbeddings
import chromadb
import hashlib
import os


class Embedder:
    def __init__(self,embedding_model):
        self.embedding_model=embedding_model
        #create a chroma path
        self.chroma_db_path=os.getenv("CHROMA","./chroma_data")
        #create the chroma db client
        self.client=chromadb.PersistentClient(path=self.chroma_db_path)
        #create collection
        self.collection=self.client.get_or_create_collection(name="synapse")
        
        
    def embed_and_store(self,metadata,chunks):
        #embed the vectors
        embedded_vectors=self.embedding_model.embed_documents(chunks)
        
        #generate ids
        ids = [hashlib.md5(chunk.encode()).hexdigest() for chunk in chunks]
        metadatas = [{"filename": metadata["file_name"],
                      "file_type": metadata["file_type"]} for chunk in chunks]
        
        # Storing
        self.collection.upsert(
            documents=chunks,
            embeddings=embedded_vectors,
            metadatas=metadatas,
            ids=ids
        )
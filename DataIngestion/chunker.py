from langchain_experimental.text_splitter import SemanticChunker as LangchainSemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings
import re

class SemanticChunker:
    def __init__(self,embedding_model):
        self.embedding_model = embedding_model
        self.chunker=LangchainSemanticChunker(self.embedding_model,
                                     breakpoint_threshold_type='percentile')
        
    
    def text_chunker(self,text):
        chunks=self.chunker.split_text(text)
        return chunks
    
    
    

class StructuralChunker:
    def __init__(self):
        pass
        
    def text_chunker(self,text):
        chunks=re.split(r'\[SLIDE \d+\]',text)
        chunks = [chunk.strip() for chunk in chunks if chunk.strip()]
        
        return chunks
    
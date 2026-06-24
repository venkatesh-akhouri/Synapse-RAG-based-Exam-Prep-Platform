from langchain_experimental.text_splitter import SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings

class PDFChunker:
    def __init__(self,embedding_model):
        self.embedding_model = embedding_model
        self.chunker=SemanticChunker(self.embedding_model,
                                     breakpoint_threshold_type='percentile')
        
    
    def text_chunker(self,text):
        chunks=self.chunker.split_text(text)
        return chunks
    
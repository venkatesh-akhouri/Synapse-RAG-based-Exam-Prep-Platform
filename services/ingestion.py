from DataIngestion.Parsers.PDFparser import PDFparser
from DataIngestion.Parsers.PPTParser import PPTParser
from DataIngestion.Parsers.DocxParser import DocxParser
from DataIngestion.chunker import StructuralChunker,SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings

EMBEDDINGS=HuggingFaceEmbeddings(model_name='sentence-transformers/all-mpnet-base-v2')

class ParserFactory:
    @staticmethod
    def call_parser(filepath):
        if filepath.endswith('.pdf'):
            return PDFparser(filepath)
        elif filepath.endswith('.docx') or filepath.endswith('.doc'):
            return DocxParser(filepath)
        elif filepath.endswith('.pptx') or filepath.endswith('.ppt'):
            return PPTParser(filepath)
        
        
class ChunkingFactory:
    @staticmethod
    def call_chunker(file_type):
        if file_type=='ppt' or file_type=='pptx':
            return StructuralChunker()
        else:
            return SemanticChunker(EMBEDDINGS)
        
        
from langchain_community.document_loaders import Docx2txtLoader
from exception import DocumentParsingError


class DocxParser:
    def __init__(self, docx_file_path):
        self.docx_file_path = docx_file_path
        self.loader = Docx2txtLoader(file_path=self.docx_file_path)
    
    def parse(self):
        
        try:
            document = self.loader.load()
            page_conetnt=document[0].page_content
            cleaned_page_content=" ".join(page_conetnt.split())
        except Exception:
            raise DocumentParsingError("Error Parsing Document")
        
        
        return {
            "file_name": self.docx_file_path,
            "file_type": "docx",
            "content": cleaned_page_content,
        }
        
    
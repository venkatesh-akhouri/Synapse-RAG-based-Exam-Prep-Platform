from langchain_community.document_loaders import Docx2txtLoader


class DocxParser:
    def __init__(self, docx_file_path):
        self.docx_file_path = docx_file_path
        self.loader = Docx2txtLoader(file_path=self.docx_file_path)
    
    def parse(self):
        document = self.loader.load()
        page_conetnt=document[0].page_content
        cleaned_page_content=" ".join(page_conetnt.split())
        
        return {
            "file_name": self.docx_file_path,
            "file_type": "docx",
            "content": cleaned_page_content,
        }
        
    
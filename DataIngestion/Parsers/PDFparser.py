from langchain_community.document_loaders import PyPDFLoader


#class for loading pdf files
class PDFparser:
    def __init__(self,file_path):
        self.file_path = file_path
        self.loader = PyPDFLoader(file_path=self.file_path)
        
        
    
    def parse(self):
        content=""
        documents=self.loader.load()
        for document in documents:
            metadata=document.metadata #return a dict
            page_number=metadata['page']+1
            page_content=" ".join(document.page_content.split())
            page_num="PAGE: "+str(page_number)+" "
            content=content+page_num+page_content
        
        file_name=documents[0].metadata['source']
        
        return {
            'file_name': file_name,
            'file_type': "pdf",        #file type is needed for chunker, as chunking strategy is decided by type of file
            'content': content
        }
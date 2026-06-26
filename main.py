from fastapi import FastAPI,File,UploadFile
import tempfile
import os
from services.ingestion import ParserFactory,ChunkingFactory,EMBEDDINGS
from DataIngestion.embedder import Embedder

from langchain_huggingface import HuggingFaceEmbeddings

#initiatise the embedder class
embedder=Embedder(EMBEDDINGS)


app = FastAPI()

@app.post("/uploadfiles/")
async def upload_files(files: list[UploadFile]):
    
    #loop through the files
    #print filenames and write it to tempdile
    for file in files:
        print(file.filename)
        extension=os.path.splitext(file.filename)[-1]
        #write to tempfile
        with tempfile.NamedTemporaryFile(delete=False,suffix=extension) as temp:
            temp.write(await file.read())
            temp_path=temp.name
            
        
        parser=ParserFactory.call_parser(temp_path)
        parsed_content=parser.parse()
        os.unlink(temp_path)
    
        #chunk the parsed content
        chunker=ChunkingFactory.call_chunker(parsed_content['file_type'])
        chunked_content=chunker.text_chunker(parsed_content['content'])
        
        #embed and store
       
        embedder.embed_and_store(parsed_content,chunked_content)
    
    return {"status": "success", "message": f"{len(files)} file(s) processed"}

        
        
        
            
            
            
            
    
   
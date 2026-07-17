from fastapi import FastAPI,File,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
import tempfile
import os
from services.ingestion import ParserFactory,ChunkingFactory,EMBEDDINGS
from DataIngestion.embedder import Embedder
from pydantic_models import ChatRequest, ChatResponse, QuizRequest,QuizResponse
from langchain_huggingface import HuggingFaceEmbeddings
from services.retreival import  retrieve
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from services.llm import get_answer,get_quiz
from exception import UnsupportedFileError,DocumentParsingError,LLMGeneratorError

load_dotenv()

ACCEPTED_DOC_FORMATS=['pdf','doc','docx']


#initialise groq api key
GROQ_API_KEY=os.getenv("GROQ_API_KEY")
#initiatise the embedder class
embedder=Embedder(EMBEDDINGS)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            
        try:
            parser=ParserFactory.call_parser(temp_path)
            parsed_content=parser.parse()
        except UnsupportedFileError:
            os.unlink(temp_path)
            raise HTTPException(status_code=415, detail="Unsupported file type")
        except DocumentParsingError:
            os.unlink(temp_path)
            raise HTTPException(status_code=422, detail="Document parsing error")
        #change the file name t original file
        parsed_content['file_name']=file.filename
        os.unlink(temp_path)
    
        #chunk the parsed content
        chunker=ChunkingFactory.call_chunker(parsed_content['file_type'])
        chunked_content=chunker.text_chunker(parsed_content['content'])
        
        #embed and store
       
        embedder.embed_and_store(parsed_content,chunked_content)
    
    return {"status": "success", "message": f"{len(files)} file(s) processed"}

        

#end point for chat
@app.post("/chat")
async def chat(request: ChatRequest ):
    retreival_results=retrieve(request.message,embedder.collection)
    
    print("----debugging-----")
    print(retreival_results["is_covered"])
    
    #check if
    if not retreival_results["is_covered"]:
        
        return ChatResponse(message="Topic not covered in uploaded materials",
                            is_covered=False)
    
    try:
        query_answer=await get_answer(request.message,retreival_results['chunks'])
    except LLMGeneratorError:
        return ChatResponse(message="I'm sorry, I encountered an internal error while trying to generate your answer. Please try again.")
    return ChatResponse(
        message=query_answer,
        source=retreival_results["sources"][0],
        is_covered=True
    )


#endpoint for quiz

@app.post("/quiz")
async def quiz(request: QuizRequest):
    retireval_results=retrieve(request.topic,embedder.collection)
    
    
    #check if the content exists in the documents
    if not retireval_results['is_covered']:
        return QuizResponse(
            message="Topic not covered in uploaded materials",
            questions=[])
    
    try:
        questions=await get_quiz(request.topic,
                                request.num_questions,
                                 retireval_results['chunks'],
                                request.format)
    except LLMGeneratorError:
        return QuizResponse(
            message="Unable to generate quiz, please try again later!"
        )
    
    
    
    
    return QuizResponse(
        questions=questions)
        
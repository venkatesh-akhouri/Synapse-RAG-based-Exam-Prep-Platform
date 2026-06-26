from pydantic import BaseModel,Field


#class for storing messages sent by the user
class ChatRequest(BaseModel):
    message: str
    

class ChatResponse(BaseModel):
    message: str
    source: str=Field(default="not covered")
    is_covered: bool
    
    

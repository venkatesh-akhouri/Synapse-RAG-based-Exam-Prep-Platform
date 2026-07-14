from pydantic import BaseModel,Field
from typing import Literal


#class for storing messages sent by the user
class ChatRequest(BaseModel):
    message: str
    

class ChatResponse(BaseModel):
    message: str
    source: str=Field(default="not covered")
    is_covered: bool


class QuizRequest(BaseModel):
    topic: str
    format : Literal["MCQ","True/False","Short/Long"]
    num_questions: int=Field(default=5)
    


class QuizResponse(BaseModel):
    questions: list
  
import os
from groq import AsyncGroq
from prompts import SYSTEM_PROMPT,get_quiz_prompt
from dotenv import load_dotenv
import json

load_dotenv()

#get api key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

#get groq client
groq_client=AsyncGroq(api_key=GROQ_API_KEY)




async def get_answer(query,chunks):
    
    #join chunks
    joined_chunks="\n".join(chunks)
    
    #now these joined chunks become the message from user
    response=await groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role":"system",
                   "content":SYSTEM_PROMPT},
                  {"role":"user",
                   "content":f"Context: {joined_chunks}\n query: {query}"}]
        
    )
    
    return response.choices[0].message.content


#the get quiz function takes the topic, format and number of questions and generates questions

async  def get_quiz(topic,num_questions,chunks,format):
    #get the context by joining chunks
    context="\n".join(chunks)
    
    #get quiz prompt
    quiz_prompt=get_quiz_prompt(format,num_questions)
    
    #these joined chunks go into llm
    response=await groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{
            "role":"system","content":quiz_prompt},
            {"role":"user","content":f"Topic : {topic}\n\nContext: {context}"
        }]
    )
    
    results=response.choices[0].message.content
    return json.loads(results)
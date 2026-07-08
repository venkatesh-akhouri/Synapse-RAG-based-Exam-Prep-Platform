import os
from groq import AsyncGroq
from prompts import SYSTEM_PROMPT
from dotenv import load_dotenv

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

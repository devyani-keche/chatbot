import os
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not set")

client = Groq(api_key=GROQ_API_KEY)

class UserInput(BaseModel):
    message: str
    role: str = "user"
    conversation_id: str

class Conversation:
    def __init__(self):
        self.messages: List[Dict[str, str]] = [
            {"role": "system", "content": "You are a helpful assistant."}
        ]

conversations: Dict[str, Conversation] = {}

def get_or_create_conversation(cid: str):
    if cid not in conversations:
        conversations[cid] = Conversation()
    return conversations[cid]

@app.post("/api/chat")
async def chat(input: UserInput):
    try:
        conv = get_or_create_conversation(input.conversation_id)
        conv.messages.append({"role": input.role, "content": input.message})

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=conv.messages
        )

        reply = response.choices[0].message.content
        conv.messages.append({"role": "assistant", "content": reply})

        return {"response": reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

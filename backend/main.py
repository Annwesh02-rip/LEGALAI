from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil

from database import save_chat, get_chats

app = FastAPI()

# 🔥 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 REQUEST MODEL
class ChatRequest(BaseModel):
    user: str
    query: str

# 🔥 SAFE RAG IMPORT (CRITICAL FIX)
def safe_rag(query):
    try:
        from rag_engine import rag_response
        return rag_response(query)
    except Exception as e:
        return f"RAG IMPORT ERROR: {str(e)}"

# 🔥 ROOT
@app.get("/")
def home():
    return {"message": "LegalAI Backend Running 🚀"}

# 🔥 CHAT
@app.post("/chat")
def chat(req: ChatRequest):
    response = safe_rag(req.query)
    save_chat(req.user, req.query, response)
    return {"response": response}

# 🔥 UPLOAD FIR
@app.post("/upload-fir")
async def upload_fir(file: UploadFile = File(...)):
    path = f"temp_{file.filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        from rag_engine import read_pdf, read_image

        if file.filename.endswith(".pdf"):
            text = read_pdf(path)
        else:
            text = read_image(path)

        response = safe_rag(text)

    except Exception as e:
        response = f"FILE PROCESS ERROR: {str(e)}"

    return {"response": response}

# 🔥 HISTORY
@app.get("/history")
def history(user: str):
    return {"history": get_chats(user)}
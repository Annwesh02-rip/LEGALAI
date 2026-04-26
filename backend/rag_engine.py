import pandas as pd
import os
import fitz   # ✅ CORRECT (PyMuPDF)
from PIL import Image
import pytesseract

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()
print("🔄 Loading RAG Engine...")

# 🔐 API KEY
OPENAI_API_KEY = os.getenv("YOUR_OPENAI_KEY")

# 🔥 LOAD DATASET SAFELY
try:
    df = pd.read_csv("bns_sections.csv")
    df.columns = df.columns.str.strip()

    df["rag_text"] = df.apply(
        lambda x: f"""
Section {x['Section']}: {x['Section _name']}
Description: {x['Description']}
""",
        axis=1
    )

    texts = df["rag_text"].tolist()

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma.from_texts(texts, embedding=embeddings)
    retriever = db.as_retriever(search_kwargs={"k": 3})

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    print("✅ RAG Engine Ready")

except Exception as e:
    print("❌ RAG INIT ERROR:", e)
    retriever = None
    llm = None


# 🔥 MAIN FUNCTION
def rag_response(query):
    if retriever is None or llm is None:
        return "RAG system not initialized"

    try:
        docs = retriever.invoke(query)
        context = " ".join([d.page_content for d in docs])

        prompt = f"""
You are a legal expert.

STRICT:
- Use only given context
- If unsure say Not applicable

Query:
{query}

Context:
{context}

Answer:
Section:
Reason:
"""

        return llm.invoke(prompt).content

    except Exception as e:
        return f"RAG ERROR: {str(e)}"


# 🔥 PDF
def read_pdf(path):
    try:
        text = ""
        doc = fitz.open(path)
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        return f"PDF ERROR: {str(e)}"


# 🔥 IMAGE OCR
def read_image(path):
    try:
        img = Image.open(path)
        return pytesseract.image_to_string(img)
    except Exception as e:
        return f"OCR ERROR: {str(e)}"
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load .env
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = os.getenv("MODEL_ID", "udhayanithi18/fortitwin-interviewer-gemma-2b-unsloth")

if not HF_TOKEN:
    raise RuntimeError("❌ HF_TOKEN is missing! Add it to your .env file.")

# Hugging Face client
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

# FastAPI app
app = FastAPI(title="ML Backend API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: list[dict]

@app.get("/")
def root():
    return {"message": "🚀 ML Backend Running!"}

# 🔥 Chat endpoint
@app.post("/api/v1/chat")
async def chat(req: ChatRequest):
    try:
        # Build conversation-style prompt
        prompt = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in req.messages])
        prompt += "\nAssistant:"

        response = client.text_generation(
            prompt=prompt,
            max_new_tokens=300,
        )

        # HuggingFace can return dict or string, handle both
        if isinstance(response, dict):
            ai_text = response.get("generated_text", "")
        else:
            ai_text = str(response)

        if not ai_text.strip():
            ai_text = "⚠️ No response generated from model."

        return {"role": "assistant", "content": ai_text}

    except Exception as e:
        return {"role": "assistant", "content": f"⚠️ Error: {str(e)}"}

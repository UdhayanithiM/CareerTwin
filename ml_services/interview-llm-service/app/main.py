# main.py (Version 2)

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
# --- NEW IMPORTS ---
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# --- 1. LOAD THE MODEL AND TOKENIZER ON STARTUP ---
# This part of the code runs only once when the server starts.
print("Loading model and tokenizer...")
# We specify the model we want to use from Hugging Face.
model_name = "microsoft/DialoGPT-small"
# The tokenizer prepares the text for the model.
tokenizer = AutoTokenizer.from_pretrained(model_name)
# The model is the actual AI brain.
model = AutoModelForCausalLM.from_pretrained(model_name)
print("Model and tokenizer loaded successfully.")


# Create an instance of the FastAPI application
app = FastAPI(
    title="Interview LLM Service",
    description="API for hosting the custom fine-tuned interview LLM.",
    version="0.1.0"
)

class ChatRequest(BaseModel):
    user_input: str
    # We will add conversation history back later. For now, just the user input.

class ChatResponse(BaseModel):
    ai_response: str


@app.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    This function now uses the real AI model to generate a response.
    """
    try:
        # --- 2. TOKENIZE THE INPUT ---
        # The model doesn't understand words, it understands numbers (tokens).
        # The tokenizer converts the user's text into these tokens.
        new_user_input_ids = tokenizer.encode(request.user_input + tokenizer.eos_token, return_tensors='pt')

        # --- 3. GENERATE A RESPONSE ---
        # We give the tokens to the model and it generates the next sequence of tokens.
        chat_history_ids = model.generate(
            new_user_input_ids, 
            max_length=1000, 
            pad_token_id=tokenizer.eos_token_id
        )

        # --- 4. DECODE THE RESPONSE ---
        # We convert the model's output tokens back into human-readable text.
        ai_response = tokenizer.decode(chat_history_ids[:, new_user_input_ids.shape[-1]:][0], skip_special_tokens=True)
        
        print("User Input:", request.user_input)
        print("AI Response:", ai_response)
        
        return ChatResponse(ai_response=ai_response)

    except Exception as e:
        print(f"Error during chat generation: {e}")
        return ChatResponse(ai_response="Sorry, I encountered an error.")


@app.get("/")
def read_root():
    return {"status": "Interview LLM Service is running with DialoGPT-small"}
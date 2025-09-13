from fastapi import FastAPI
from pydantic import BaseModel
from vllm import LLM, SamplingParams
import torch

app = FastAPI()

try:
    llm = LLM(model="meta-llama/Meta-Llama-3-8B-Instruct", tensor_parallel_size=torch.cuda.device_count() or 1)
except Exception as e:
    print(f"Error loading model: {e}")
    llm = None

sampling_params = SamplingParams(temperature=0.7, top_p=0.95, max_tokens=1024)

class ChatInput(BaseModel):
    prompt: str

@app.post("/generate")
async def generate(chat_input: ChatInput):
    if not llm:
        return {"error": "Model is not available."}

    messages = [
        {"role": "system", "content": "You are an expert technical interviewer conducting a job interview. Your goal is to assess the candidate's skills and knowledge. Start with a greeting and your first question."},
        {"role": "user", "content": chat_input.prompt},
    ]
    
    prompt_tokenized = llm.get_tokenizer().apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    
    outputs = await llm.generate(prompt_tokenized, sampling_params)
    
    generated_text = outputs[0].outputs[0].text
    return {"response": generated_text}